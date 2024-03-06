<?php

namespace App\Http\Controllers\Learning;

use App\Helpers\Breadcrumb;
use App\Helpers\UserRole;
use App\Helpers\Mentor;
use App\Helpers\RabbitMq;
use App\Http\Controllers\Controller;
use App\Services\BranchService\Branch;
use App\Services\LearningService\ClassRoom;
use App\Services\ProductService\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class ClassController extends Controller
{

  private ClassRoom $classService;
  private Branch $branchService;
  private Product $productService;

  public function __construct(ClassRoom $classService, Branch $branchService, Product $productService)
  {
    $this->middleware('acl');
    $this->classService = $classService;
    $this->branchService = $branchService;
    $this->productService = $productService;
    Breadcrumb::setFirstBreadcrumb('Pembelajaran', 'pembelajaran');
  }

  public function index()
  {
    $allowed = UserRole::getAllowed('roles.learning_classroom');
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    $classSummary = $this->classService->getSummary(['branch_code' => Auth::user()?->branch_code]);
    $branches = $this->branchService->getBranchs();
    $auth_user_id = auth()->user()->id;
    $auth_user_branch_code = auth()->user()->branch_code;
    if(UserRole::isMentor() && !UserRole::isBranchAdmin()) $auth_user_branch_code = Mentor::getWithScheduledClassBranchCode();
    $products = $this->productService->getProducts("true", '', '', auth()->user()->branch_code) ?? [];
    $isCentralAdminUser = UserRole::isAdmin() && !UserRole::isBranchUser();
    $userType = $isCentralAdminUser ? "central" : "branch";
    $user = Auth::user();
    $userACL = $user->resources ?? [];
    $canShowAllClassroom = in_array("office_v2.learning_classroom.show_all_classroom", $userACL);
    if(is_string($auth_user_branch_code)) $is_user_has_multiple_branch_code = strpos($auth_user_branch_code, ',') !== false;
    if(is_array($auth_user_branch_code)) $is_user_has_multiple_branch_code = strpos($auth_user_branch_code["originalString"], ',') !== false;
    if(!UserRole::isAdmin()) {
      return view(
        '/pages/learning/class/index-branch',
        compact(
          'breadcrumbs', 'classSummary', 'allowed', 'branches', 'auth_user_id', 'auth_user_branch_code', 'is_user_has_multiple_branch_code',
          'products', 'userType', 'canShowAllClassroom'
        )
      );
    }
    return view(
      '/pages/learning/class/index',
      compact('breadcrumbs', 'classSummary', 'allowed', 'branches', 'auth_user_branch_code', 'auth_user_id', 'products', 'userType')
    );
  }

  public function showEditClass(Request $request, $classId)
  {
    $class = $this->classService->getSingle($classId);
    $branches = $this->branchService->getBranchs();
    $products = $this->productService->getProducts("true", '', '', auth()->user()->branch_code) ?? [];
    $isCentralAdminUser = UserRole::isAdmin() && !UserRole::isBranchUser();
    $userType = $isCentralAdminUser ? "central" : "branch";
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ['name' => "Edit $class->title"]
    ];
    return view(
      '/pages/learning/class/edit',
      compact('breadcrumbs', 'class', 'branches', 'products', 'userType')
    );
  }

  public function shareClassroomForm($classId)
  {
    $class = $this->classService->getSingle($classId);
    $branches = $this->branchService->getBranchs();
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ['name' => "Bagikan $class->title"]
    ];
    return view('/pages/learning/class/share', compact('breadcrumbs', 'class', 'branches'));
  }

  public function sharedClassroomUsers($classId)
  {
    $classroom = $this->classService->getSingle($classId);
    $sharedClassroom = $this->classService->getSharedClassroomByClassroomID($classId);
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ['name' => "Pengguna Kelas Dibagikan $classroom->title"]
    ];
    return view('/pages/learning/class/shared-classroom-user', compact('breadcrumbs', 'classroom', 'sharedClassroom'));
  }

  public function createSharedClassroom(Request $request, $classId)
  {
    if(!UserRole::isAdmin()) return redirect()->back();

    $validator = Validator::make($request->all(), [
      "branch_code" => ["required"],
      "sso_id" => ["required"]
    ]);
    if($validator->fails()) return redirect()->back()->withErrors($validator)->withInput();

    $payload = ["classroom_id" => $classId, "sso_id" => $request->sso_id];
    $response = $this->classService->createSharedClassroomBulk($payload);
    $responseBody = json_decode($response?->body());
    $responseStatus = $response->status();

    if($responseStatus == Response::HTTP_CREATED) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Shared classroom berhasil ditambah'
        ]
      );
    } else {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Gagal!',
          'type' => 'error',
          'message' => $responseBody?->messages[0]
        ]
      );
    }

    return redirect('/pembelajaran');
  }

  public function update(Request $request, $classId)
  {
    $this->validate($request, [
      'title' => 'required',
      'description' => 'nullable',
      'year' => 'required',
      'quota' => 'required|min:1',
      'quota_filled' => 'nullable',
      'product_id' => 'nullable',
      'status' => 'required',
      'tags' => 'nullable',
    ]);
    $is_online = $request->has('is_online') && in_array($request->is_online, ["true", "on"]);
    $product_id = $request->has('product_id') && $request->product_id ? $request->product_id : "1";
    $payload = array_merge($request->all(), ['product_id' => $product_id, 'is_online' => $is_online]);
    $response = $this->classService->update($classId, $payload);
    $body = json_decode($response->body());

    if ($response->successful()) {
      // Send updated classroom data from $body to message broker
      $brokerPayload = [
        "version" => 1,
        "data" => [
          "id" => $classId,
          "title" => $body->data->title,
          "branch_code" => $body->data->branch_code,
          "year" => $body->data->year,
          "quota" => $body->data->quota,
          "quota_filled" => $body->data->quota_filled,
          "tags" => $body->data->tags,
          "description" => $body->data->description,
          "status" => $body->data->status,
          "is_online" => $body->data->is_online,
          "product_id" => $body->data->product_id
        ]
      ];
      RabbitMq::send("classroom.updated", json_encode($brokerPayload));
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Update Kelas sukses'
        ]
      );
    } else {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Gagal!',
          'type' => 'error',
          'message' => 'Update Kelas gagal. coba lagi nanti'
        ]
      );
    }
    return redirect('/pembelajaran');
  }
}
