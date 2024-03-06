<?php

namespace App\Http\Controllers\Api;

use App\Helpers\RabbitMq;
use App\Helpers\S3;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\AffiliateService\Affiliate;
use App\Services\ApiGatewayService\Internal;
use Illuminate\Support\Facades\Auth;
use App\Services\ProductService\Product;
use App\Services\FinanceService\Finance;
use App\Services\LearningService\ClassMember;
use App\Services\LearningService\ClassRoom;
use App\Services\LearningService\Student;
use App\Services\ProfileService\Profile;
use App\Services\BranchService\Branch;
use App\Services\NewAffiliateService\DiscountCode;
use App\Services\LocationService\Location;
use App\Services\HighSchoolService\HighSchool;
use App\Services\CompetitionMapService\School;
use App\Types\StudentSale;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

class SaleController extends Controller
{

  private Product $serviceProduct;
  private Finance $serviceFinance;
  private ClassRoom $serviceClassRoom;
  private ClassMember $serviceClassMember;
  private Student $serviceLearningStudent;
  private Affiliate $serviceAffiliate;
  private Internal $serviceInternal;
  private Profile $serviceProfile;
  private Branch $serviceBranch;
  private DiscountCode $serviceDiscountCodeAffiliate;
  private Location $serviceLocation;
  private Highschool $serviceHighschool;
  private School $serviceCompMapSchool;

  public function __construct(
    Product $productService,
    Finance $financeService,
    ClassRoom $classRoomService,
    ClassMember $classMemberService,
    Student $studentLearningService,
    Affiliate $affiliateService,
    Internal $internalService,
    Profile $profileService,
    Branch $branchService,
    DiscountCode $discountCodeAffiliateService,
    Location $serviceLocation,
    HighSchool $serviceHighschool,
    School $serviceCompMapSchool
  ) {
    $this->serviceProduct = $productService;
    $this->serviceFinance = $financeService;
    $this->serviceClassRoom = $classRoomService;
    $this->serviceClassMember = $classMemberService;
    $this->serviceLearningStudent = $studentLearningService;
    $this->serviceAffiliate = $affiliateService;
    $this->serviceInternal = $internalService;
    $this->serviceProfile = $profileService;
    $this->serviceBranch = $branchService;
    $this->serviceDiscountCodeAffiliate = $discountCodeAffiliateService;
    $this->serviceLocation = $serviceLocation;
    $this->serviceHighschool = $serviceHighschool;
    $this->serviceCompMapSchool = $serviceCompMapSchool;
  }

  public function getAllProduct(Request $request)
  {
    $branchCode = Auth::user()->branch_code ?? '';
    $productType = $request->type ?? '';
    $data = $this->serviceProduct->getProducts(
      status: "true",
      type: $productType,
      branch_code: $branchCode,
      page: $request->page,
      perPage: $request->per_page,
      title: $request->title ?? '',
      tags: $request->tags ?? null,
      program: $request->program ?? ''
    );
    return response()->json(['data' => $data]);
  }

  public function searchStudent(Request $request)
  {
    $user = Auth::user();
    $data = [];
    $responseStatus = 200;
    if ($user) {
      $query = [
        'value' => $request->email,
        'branch_code' => $user->branch_code
      ];
      $data = $this->serviceInternal->searchStudents($query);
    } else {
      $responseStatus = 419;
    }
    return response()->json(['data' => $data], $responseStatus);
  }

  public function createStudent(Request $request)
  {
    $url = env('SERVICE_API_GATEWAY_ADDRESS') . '/internal/students/';
    $params = [
      'nama_lengkap' => $request->nama_lengkap,
      'email' => $request->email,
      'no_wa' => $request->no_wa,
      'jk' => $request->jk,
      'ttl' => $request->ttl,
      'nama_ortu' => $request->nama_ortu,
      'hp_ortu' => $request->hp_ortu,
      'alamat' => $request->alamat,
      'id_provinsi' => $request->id_provinsi,
      'kab_kota_id' => $request->kab_kota_id,
      'asal_sekolah' => $request->asal_sekolah,
      'jurusan' => $request->jurusan,
      'pendidikan_terakhir' => $request->pendidikan_terakhir,
      'tujuan_tryout' => $request->tujuan_tryout,
      'school_origin_id' => $request->school_origin_id,
      'kode_cabang' => $request->branch_code ?? Auth::user()->branch_code,
      'account_type' => $request->account_type ? $request->account_type : "btwedutech",
      'status' => 1,
      'is_guest' => 0,
      'last_education_id' => $request->last_education_id,
      'birth_mother_name' => $request->birth_mother_name,
      'birth_place' => $request->birth_place,
      'nik' => $request->nik
    ];
    $response = Http::withHeaders([
      'X-Office-Token' => env('SERVICE_API_GATEWAY_TOKEN_OFFICE')
    ])->post($url, $params);

    $responseStatus = $response->status();
    $responseBody = json_decode($response->body());
    return response()->json($responseBody, $responseStatus);
  }

  public function updateStudent(Request $request)
  {
    $studentId = $request->student_id;
    $url = env('SERVICE_API_GATEWAY_ADDRESS') . '/internal/students/' . $studentId;
    $request_params = [
      'nama_lengkap' => $request->nama_lengkap,
      'email' => $request->email,
      'no_wa' => $request->no_wa,
      'jk' => $request->jk,
      'ttl' => $request->ttl,
      'nama_ortu' => $request->nama_ortu,
      'hp_ortu' => $request->hp_ortu,
      'alamat' => $request->alamat,
      'id_provinsi' => $request->id_provinsi,
      'kab_kota_id' => $request->kab_kota_id,
      'asal_sekolah' => $request->asal_sekolah,
      'jurusan' => $request->jurusan,
      'school_origin_id' => $request->school_origin_id,
      'pendidikan_terakhir' => $request->pendidikan_terakhir,
      'tujuan_tryout' => $request->tujuan_tryout,
      'kode_cabang' => Auth::user()->branch_code,
      'status' => 1,
      'is_guest' => 0,
      'last_education_id' => $request->last_education_id,
      'account_type' => "btwedutech",
      'birth_mother_name' => $request->birth_mother_name,
      'birth_place' => $request->birth_place,
      'nik' => $request->nik
    ];
    $response = Http::withHeaders(['X-Office-Token' => env('SERVICE_API_GATEWAY_TOKEN_OFFICE')])->put($url, $request_params);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    $profile = $this->serviceProfile->getSingleStudent((int)$studentId);

    $studentHasParentData = !empty($profile) && property_exists($profile, "parent_datas");
    $parentDataIsFilled = !empty($request->nama_ortu) && !empty($request->parent_number);
    if ($studentHasParentData) {
      $this->serviceProfile->updateParentData(["smartbtw_id" => (int)$studentId, "parent_name" => $request->nama_ortu, "parent_number" => $request->hp_ortu]);
    }
    if (!$studentHasParentData && $parentDataIsFilled) {
      $this->serviceProfile->createParentData(["smartbtw_id" => (int)$studentId, "parent_name" => $request->nama_ortu, "parent_number" => $request->hp_ortu]);
    }

    if ($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Data siswa berhasil diupdate'
      ]);
    } else {
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => 'Proses update data siswa gagal'
      ]);
    }

    return response()->json($responseBody, $responseStatus);
  }

  public function getClassroom()
  {
    $query = [
      'branch_code' => Auth::user()?->branch_code,
      'only_quota_available' => 1,
      'status' => ['ONGOING', 'NOT_ACTIVE']
    ];
    $data = $this->serviceClassRoom->getAll($query);
    return response()->json(['data' => $data]);
  }

  public function processTransaction(Request $request)
  {
    $user = Auth::user();
    $isCentralUser = Auth::user()->branch_code === "PT0000" || !Auth::user()->branch_code;

    $proofFile = $request->file('proof');
    $proofFileName = "";
    $proofImgUrl = "";

    if ($proofFile) {
      $proofFileName = $proofFile->getClientOriginalName();
      $fileExtension = $proofFile->extension();
      $fileMimeType = $proofFile->getMimeType();

      $validFileExtensions = ["jpg", "jpeg", "png", "gif", "pdf"];
      $validFileMimeType = ["image/jpeg", "image/png", "image/gif", "application/pdf"];

      $isValidFile = in_array($fileExtension, $validFileExtensions) && in_array($fileMimeType, $validFileMimeType);
      if (!$isValidFile) return response()->json(["success" => false, "message" => "File yang ditambahkan tidak valid. Silakan masukkan file gambar atau pdf"], 422);
      $targetPath = "/uploads/office/sale/proof";
      $proofImgUrl = S3::storeOriginal($targetPath, $proofFile);
    }

    $studentId = (int) $request->smartbtw_id;
    $studentName = $request->bill_to;
    $studentEmail = $request->email;
    $studentPhone = $request->phone;
    $classroomId = $request->class_id;
    $packetTitle = $request->packet_title;
    $installment_pay = (int)$request->installment_pay;
    $finalDiscount = (int) $request->final_discount;
    $finalTax = (int) $request->final_tax;
    $dueDate = $request->due_date;
    $nik = $request->nik;
    $productType = $request->product_type;
    $paymentMethod = $request->payment_method;
    $promoCode = $request->discount_code ? $request->discount_code : null;
    $packetPrice = (int)$request->packet_price;
    $createdAt = Carbon::parse($request->created_at)->timezone('Asia/Jakarta');
    $branchCodeCenter = "PT0000";
    $branchCode = $user->branch_code ? $user->branch_code : $branchCodeCenter;
    $productItems = json_decode($request->product_items);
    $mainProduct = json_decode($request->main_product);
    $mainProductTags = $mainProduct->tags;
    $screeningResult = json_decode($request->screening_result);

    $billBranch = $this->serviceBranch->getBranchByCode($branchCode);
    $branchTag = $billBranch?->tag ?? null;

    // Add validation for coin currency
    if ($productType === "COIN_CURRENCY") {
      if ($paymentMethod !== "MIDTRANS") {
        return response()->json(['success' => false, 'error' => 'invalid payment method', 'message' => 'top up coin transaction can only be processed via midtrans'], 400);
      }
      if ((int)$request->paid_bill !== $packetPrice - ($finalDiscount + $finalTax)) {
        return response()->json(['success' => false, 'error' => 'invalid paid bill value', 'message' => 'this product cannot be paid in installment'], 400);
      }
      if ($finalDiscount !== 0) {
        return response()->json(['success' => false, 'error' => 'non-zero discount value occured', 'message' => 'this product cannot have any discount'], 400);
      }
    }

    if ($promoCode) {
      // Check again the eligibility of the code
      $discountCodeEligibilityCheckResponse = $this->serviceDiscountCodeAffiliate->checkEligibility([
        "smartbtw_id" => (int)$studentId,
        "product_code" => $mainProduct->product_code,
        "discount_code" => $promoCode,
        "amount" => $packetPrice,
        "branch_code" => $mainProduct->branch_code
      ], null);
      $discountCodeEligibilityCheckBody = json_decode($discountCodeEligibilityCheckResponse->body());
      $discountCodeEligibilityCheckStatusCode = $discountCodeEligibilityCheckResponse->status();
      if (!$discountCodeEligibilityCheckBody->success && $discountCodeEligibilityCheckStatusCode !== 200) {
        return response()->json(["success" => $discountCodeEligibilityCheckBody->success, "error" => $discountCodeEligibilityCheckBody->error, "message" => $discountCodeEligibilityCheckBody->error], $discountCodeEligibilityCheckStatusCode);
      }
    }

    if (!is_null($screeningResult) && $screeningResult->is_eligible_to_discount && $screeningResult->selected_discount_code) {
      $updateStudentInterestResponse = $this->serviceInternal->updateStudentInterest($studentId, "FIX");
      if (!$updateStudentInterestResponse->successful()) return response()->json(['success' => false, 'error' => 'update when updating student interest', 'message' => 'Silakan coba lagi'], 400);
    }

    $payload = [
      "branch_code" => $branchCode,
      "discount_code" => $promoCode,
      "smartbtw_id" => $studentId,
      "bill_to" => $studentName,
      "phone" => $studentPhone,
      "email" => $studentEmail,
      "nik" => $nik,
      "address" => $request->address,
      "title" => $packetTitle,
      "due_date" => $dueDate,
      "final_discount" => $finalDiscount,
      "final_tax" => $finalTax,
      "final_bill" => $packetPrice,
      "installment_pay" => $installment_pay,
      "paid_bill" => (int) $request->paid_bill,
      "created_by" => $user->name,
      "product_type" => $productType,
      "product_code" => $mainProduct->product_code,
      "coin_amount" => $mainProduct->coin_amount,
      "paid_now" => (bool) $request->paid_now,
      "note" => $request->note,
      // "payment_method" => "MIDTRANS",
      "payment_method" => $paymentMethod,
      "created_at" => $createdAt ?? Carbon::now(),
      "legacy_bill_id" => null,
      "legacy_transaction_id" => null,
      "proof_payment" =>
      $proofFile ? [
        "name" => $proofFileName,
        "path" => $proofImgUrl
      ] : (object) [],
      "product_items" => $productItems,
    ];
    $manualBankTransferPaymentMethods = ["MANUAL_TF_BCA", "MANUAL_TF_BRI", "MANUAL_TF_BNI"];
    $manualBankTransferPaymentNames = ["MANUAL_TF_BCA" => "Bank BCA", "MANUAL_TF_BRI" => "Bank BRI", "MANUAL_TF_BNI" => "Bank BNI"];

    $isRegulerProduct = in_array("REGULER_PRODUCT", $mainProductTags);
    $centralFeeResponse = $this->serviceFinance->getCentralFeePerBranch(
      productCode: $mainProduct->product_code,
      branchCode: $branchCode,
      productPrice: $packetPrice
    );
    $centralFee = $branchTag === "FRANCHISE" ? json_decode($centralFeeResponse->body())?->data ?? 0 : 0;
    if ($classroomId) $payload["classroom_id"] = $classroomId;
    if ($isCentralUser) {
      $responseBody = $this->serviceFinance->processCentralOnlineSaleTransaction($payload);
    } else if (!$isCentralUser && $branchTag === "FRANCHISE" && $paymentMethod === "CASH" && !$isRegulerProduct && $centralFee > 0) {
      $responseBody = $this->serviceFinance->processFranchiseCashOfflineSaleTransaction($payload);
    } else {
      $responseBody = $this->serviceFinance->processBranchOfflineSaleTransaction($payload);
    }

    if (isset($responseBody->success) && $responseBody->success) {

      /* Insert student to class */
      if (
        // Pembayaran produk tatap muka online secara cash oleh cabang pusat (PT0000)
        ($isCentralUser && $classroomId && $paymentMethod === "CASH") ||
        // Pembayaran produk offline oleh cabang dikelola pusat
        ($classroomId && $productType === "OFFLINE_PRODUCT" && $branchTag !== "FRANCHISE" && $paymentMethod === "CASH") ||
        // Pembayaran produk reguler offline oleh cabang franchise secara cash
        ($classroomId && $productType === "OFFLINE_PRODUCT" && $branchTag === "FRANCHISE" && $paymentMethod === "CASH" && $isRegulerProduct) ||
        // Pembayaran produk offline oleh cabang franchise secara cash dengan royalti 0
        ($classroomId && $productType === "OFFLINE_PRODUCT" && $branchTag === "FRANCHISE" && $paymentMethod === "CASH" && $centralFee === 0)
      ) {
        $this->serviceClassMember->addStudentToClass(
          smartbtw_id: $studentId,
          classroom_id: $classroomId
        );
      }

      if (
        // Pembayaran produk online / tatap muka online oleh pusat menggunakan cash
        ($isCentralUser && $productType !== "OFFLINE_PRODUCT" && $paymentMethod === "CASH") ||
        // Pembayaran produk offline oleh cabang dikelola pusat dengan metode pembayaran cash
        ($productType === "OFFLINE_PRODUCT" && $branchTag !== "FRANCHISE" && $paymentMethod === "CASH") ||
        // Pembayaran produk reguler offline oleh cabang franchise dengan metode pembayaran cash
        ($productType === "OFFLINE_PRODUCT" && $branchTag === "FRANCHISE" && $paymentMethod === "CASH" && $isRegulerProduct) ||
        // Pembayaran produk offline oleh cabang franchise secara cash dengan royalti 0
        ($productType === "OFFLINE_PRODUCT" && $branchTag === "FRANCHISE" && $paymentMethod === "CASH" && $centralFee === 0)
      ) {
        /* Activate student product */
        $productActivationBody = [
          "product_code" => $mainProduct->product_code,
          "branch_code" => $mainProduct->branch_code,
          "smartbtw_id" => $studentId,
          "name" => $studentName,
          "email" => $studentEmail,
          "phone" => $studentPhone,
          "status" => true,
          "date_activated" => $createdAt ?? Carbon::now()
        ];
        $this->serviceProduct->createActivation($productActivationBody);
      }

      $this->serviceInternal->updateStudentBranchCode(
        studentId: $studentId,
        branchCode: $branchCode
      );

      $promoTransactionBody = [
        "code" => $promoCode,
        "student_id" => $studentId,
        "product_price" => $packetPrice,
        "desc" => "Pembelian " . $packetTitle,
      ];
      $this->serviceAffiliate->createTransaction($promoTransactionBody);
      if (in_array($paymentMethod, $manualBankTransferPaymentMethods)) {
        $student = new StudentSale();
        $student->name = $studentName;
        $student->email = $studentEmail;
        $student->phone = env('APP_ENV') == 'dev' ? '6282237808008' : '6281933033433';
        $student->branchCode = $branchCode;
        $student->productName = $packetTitle;
        $student->amount = $request->paid_bill;
        $student->billId = $responseBody->data->ID;
        $student->transactionId = $responseBody->data->transaction_id;
        $student->createdAt = $createdAt ?? Carbon::now();
        $student->paymentMethod = $manualBankTransferPaymentNames[$paymentMethod];
        $student->fileName = $proofFileName;
        $student->urlFile = $proofImgUrl;
        if ($student->fileName && $student->urlFile) $this->serviceFinance->sendSaleMessage($student);
      }

      /* Assign student received module */
      if (
        // Pembelian produk online / tatap muka online oleh user pusat secara cash
        ($isCentralUser && $productType !== "OFFLINE_PRODUCT" && $paymentMethod === "CASH") ||
        // Pembelian produk offline oleh cabang dikelola pusat dengan metode pembayaran cash
        ($productType === "OFFLINE_PRODUCT" && $branchTag !== "FRANCHISE" && $paymentMethod === "CASH") ||
        // Pembelian produk reguler offline oleh cabang franchise dengan metode pembayaran cash
        ($productType === "OFFLINE_PRODUCT" && $branchTag === "FRANCHISE" && $paymentMethod === "CASH" && $isRegulerProduct) ||
        // Pembayaran produk offline oleh cabang franchise secara cash dengan royalti 0
        ($productType === "OFFLINE_PRODUCT" && $branchTag === "FRANCHISE" && $paymentMethod === "CASH" && $centralFee === 0)
      ) {
        $this->serviceInternal->sendReceiveModule($studentId);
      }
      return response()->json(['data' => $responseBody->data], 201);
    } else {
      return response()->json(['data' => $responseBody], 422);
    }
  }

  public function checkPromoCode(Request $request)
  {
    $payload = [
      'code' => $request->code,
      'student_id' => $request->student_id
    ];
    $response = $this->serviceAffiliate->getPromoByCode($payload);
    $status = $response->status;
    return response()->json([
      'data' => $response->data,
      'messages' => $response->messages
    ], $status);
  }

  public function checkCentralFee(Request $request)
  {
    $response = $this->serviceFinance->getCentralFeePerBranch(
      productCode: $request->product_code,
      branchCode: $request->branch_code,
      productPrice: $request->product_price
    );

    $status = $response->status();
    $resBody = json_decode($response->body());

    if (isset($resBody->success) && $resBody->success) {
      return response()->json([
        'data' => $resBody->data,
        'messages' => $resBody->message
      ], $status);
    } else {
      return response()->json(['data' => $resBody], $status);
    }
  }

  public function getStudentData($studentId)
  {
    $student_profile_elastic = $this->serviceProfile->getSingleStudentFromElastic((int) $studentId);

    // Get student address and parent data
    $student_profile_mongo = $this->serviceProfile->getSingleStudent((int) $studentId);
    $student_profile_elastic->address = isset($student_profile_mongo->address) ? $student_profile_mongo->address : "";
    $student_profile_elastic->parent_name = isset($student_profile_mongo->parent_datas) ? $student_profile_mongo->parent_datas->parent_name : "";
    $student_profile_elastic->parent_number = isset($student_profile_mongo->parent_datas) ? $student_profile_mongo->parent_datas->parent_number : "";
    $student_profile_elastic->nik = isset($student_profile_mongo->nik) ? $student_profile_mongo->nik : "";
    $student_profile_elastic->birth_mother_name = isset($student_profile_mongo->birth_mother_name) ? $student_profile_mongo->birth_mother_name : "";
    $student_profile_elastic->birth_place = isset($student_profile_mongo->birth_place) ? $student_profile_mongo->birth_place : "";

    $provincesResponse = $this->serviceLocation->get(["type" => "PROVINCE"]);
    $provinces = json_decode($provincesResponse->body())?->data ?? [];

    $regionsResponse  = $this->serviceLocation->get(["type" => "REGION"]);
    $regions = json_decode($regionsResponse->body())?->data ?? [];

    // Get student location
    $student_province = null;
    $student_district = null;

    if ($student_profile_elastic->province_id) {
      $student_province = collect($provinces)->where('_id', $student_profile_elastic->province_id)->first();
      $student_district = collect($regions)->where('_id', $student_profile_elastic->region_id)->first();
    }

    // Get student domicile location
    $student_domicile_province = null;
    $student_domicile_district = null;

    if ($student_profile_elastic->domicile_province_id) {
      $student_domicile_province = collect($provinces)->where('_id', $student_profile_elastic->domicile_province_id)->first();
    }

    if ($student_profile_elastic->domicile_region_id) {
      $student_domicile_district = collect($regions)->where('_id', $student_profile_elastic->domicile_region_id)->first();
    }

    // Get student location
    $student_highschool_province = null;
    $student_highschool_district = null;

    // Get student highschool initial districts
    $student_highschool_initial_districts = [];

    if ($student_profile_elastic->last_ed_region_id) {
      $student_highschool_district = collect($regions)
        ->where('_id', $student_profile_elastic->last_ed_region_id)
        ->first();
      $student_highschool_province = collect($provinces)
        ->where('_id', $student_highschool_district->parent_id)
        ->first();
      $student_highschool_initial_districts = collect($regions)
        ->where("parent_id", $student_highschool_province->_id)
        ->map(function ($item) {
          $item->label = $item->name;
          $item->value = $item->_id;
          return $item;
        })
        ->values()
        ->toArray();
    }

    // Get student initial majors/educations
    $student_initial_majors = [];
    $student_initial_major = null;
    if ($student_profile_elastic->last_ed_type) {
      $student_initial_majors_response = $this->serviceCompMapSchool->getSchoolOriginEducations($student_profile_elastic->last_ed_type);
      $student_initial_majors = collect(
        json_decode($student_initial_majors_response->body())?->data ?? []
      )
        ->map(function ($item) {
          $item->label = $item->name;
          $item->value = $item->id;
          return $item;
        })
        ->values()
        ->toArray();
      if ($student_profile_elastic->last_ed_major_id) {
        $student_initial_major = collect($student_initial_majors)
          ->where('id', $student_profile_elastic->last_ed_major_id)
          ->first();
      }
    }
    // Get student initial highschools
    $initial_highschools = [];
    $student_initial_highschool = null;
    if (
      $student_profile_elastic->last_ed_type &&
      $student_profile_elastic->last_ed_id &&
      $student_profile_elastic->last_ed_major_id &&
      $student_profile_elastic->last_ed_region_id
    ) {
      $initial_highschools_response = $this->serviceHighschool->get([
        "type" => $student_profile_elastic->last_ed_type,
        "location_id" => $student_profile_elastic->last_ed_region_id
      ]);
      $initial_highschools = collect(
        json_decode($initial_highschools_response->body())?->data ?? []
      )
        ->map(function ($item) {
          $item->label = $item->name;
          $item->value = $item->_id;
          return $item;
        })
        ->values()
        ->toArray();
      $student_initial_highschool = collect($initial_highschools)
        ->where('_id', $student_profile_elastic->last_ed_id)
        ->first();
    }

    $student_profile_elastic->student_province = $student_province;
    $student_profile_elastic->student_district = $student_district;
    $student_profile_elastic->student_domicile_province = $student_domicile_province;
    $student_profile_elastic->student_domicile_district = $student_domicile_district;
    $student_profile_elastic->student_highschool_province = $student_highschool_province;
    $student_profile_elastic->student_highschool_district = $student_highschool_district;
    $student_profile_elastic->student_highschool = $student_initial_highschool;
    $student_profile_elastic->student_major = $student_initial_major;
    $student_profile_elastic->initial_majors = $student_initial_majors;
    $student_profile_elastic->initial_highschools = $initial_highschools;
    $student_profile_elastic->initial_highschool_districts = $student_highschool_initial_districts;
    return response()->json(['data' => $student_profile_elastic]);
  }

  public function checkSiswaUnggulanScreeningResult(Request $request)
  {
    $matematika = $request->matematika;
    $bahasa_indonesia = $request->bahasa_indonesia;
    $bahasa_inggris = $request->bahasa_inggris;
    $iq_score = $request->iq_score;
    $uka_score = $request->uka_score;
    $height = $request->height;
    $bmi = $request->bmi;
    $is_color_blind = $request->is_color_blind;
    $leg_x = $request->leg_x;
    $leg_o = $request->leg_o;
    $gender = $request->gender;
    $product = $request->product;
    $smartbtw_id = $request->smartbtw_id;

    $is_eligible_to_discount = false;
    $selected_discount_code = null;
    $response_message = "Siswa tidak mendapatkan diskon siswa unggulan";
    $received_discount_amount = 0;

    $minimum_requirements = [
      "matematika" => 9,
      "bahasa_indonesia" => 9,
      "bahasa_inggris" => 9,
      "iq_score" => 110,
      "uka_score" => 450,
      "is_color_blind" => false,
      "height" => $gender == "Male" ? 165 : 160,
      "leg_x" => 6,
      "leg_o" => 6,
      "bmi_minimum_range" => 18.5,
      "bmi_maximum_range" => 24.9
    ];

    if ($request->program == "utbk") {
      $minimum_requirements["uka_score"] = 600;
    }

    $results = [
      "matematika" => $matematika >= $minimum_requirements["matematika"],
      "bahasa_indonesia" => $bahasa_indonesia >= $minimum_requirements["bahasa_indonesia"],
      "bahasa_inggris" => $bahasa_inggris >= $minimum_requirements["bahasa_inggris"],
      "iq_score" => $iq_score >= $minimum_requirements["iq_score"],
      "uka_score" => $uka_score >= $minimum_requirements["uka_score"]
    ];

    if ($request->program == "skd") {
      $results["height"] = $height >= $minimum_requirements["height"];
      $results["bmi"] = $bmi >= $minimum_requirements["bmi_minimum_range"] && $bmi <= $minimum_requirements["bmi_maximum_range"];
      $results["is_color_blind"] = $is_color_blind == $minimum_requirements["is_color_blind"];
      $results["leg_x"] = $leg_x < $minimum_requirements["leg_x"];
      $results["leg_o"] = $leg_o < $minimum_requirements["leg_o"];
    }
    $is_eligible_to_discount = $this->checkSiswaUnggulanDiscountEligibility($results);
    if ($is_eligible_to_discount) {
      $discount_codes_response = $this->serviceDiscountCodeAffiliate->getAll($product["branch_code"]);
      $discount_codes = json_decode($discount_codes_response->body())?->data;
      if (isset($discount_codes) && count($discount_codes) > 0) {
        $discount_code = collect($discount_codes)
          ->filter(function ($item) use ($product) {
            $isSystemOnly = $item->system_only;
            $isActive = $item->status;
            $isSpecificProduct = $item->usage_type == "SPECIFIC_PRODUCT";
            $isBranchDiscountCode = $item->identifier_type == "BRANCH" && $item->identifier == $product["branch_code"];
            $isSiswaUnggulanDiscountCode = is_array($item->tags) && in_array("SISWA_UNGGULAN", $item->tags);
            $isProductDiscountCodeAvailable = count($item->discount_specific_product) > 0
              && collect($item->discount_specific_product)
              ->where("product_code", $product["product_code"])
              ->count() > 0;
            $isDiscountCodeNotFullyUsed = count($item->history_usage_code) < $item->max_usage;
            return $isSystemOnly
              && $isActive
              && $isSpecificProduct
              && $isBranchDiscountCode
              && $isSiswaUnggulanDiscountCode
              && $isProductDiscountCodeAvailable
              && $isDiscountCodeNotFullyUsed;
          })
          ->values()
          ->toArray();
      }
      if (count($discount_code)) {
        // Check discount code eligibility
        $eligibility_response = $this->serviceDiscountCodeAffiliate->checkEligibility([
          "discount_code" => $discount_code[0]->code,
          "smartbtw_id" => $smartbtw_id,
          "amount" => $product["price"],
          "product_code" => $product["product_code"],
          "branch_code" => $product["branch_code"]
        ], "true");
        $eligibility_body = json_decode($eligibility_response->body());
        if (!$eligibility_response->successful()) {
          return response()->json([
            "is_eligible_to_discount" => false,
            "selected_discount_code" => null,
            "received_discount_amount" => $received_discount_amount,
            "message" => $response_message
          ]);
        }
        $selected_discount_code = $discount_code[0]->code;
        $response_message = $discount_code[0]->amount_type == "PERCENT"
          ? "Siswa mendapat diskon siswa unggulan sebesar " . $discount_code[0]->amount . "%"
          : "Siswa mendapat diskon siswa unggulan sebesar Rp. " . number_format($discount_code[0]->amount);
        $received_discount_amount = $eligibility_body->data->discount;
      }
    }
    return response()->json([
      "is_eligible_to_discount" => $is_eligible_to_discount,
      "selected_discount_code" => $selected_discount_code,
      "received_discount_amount" => $received_discount_amount,
      "message" => $response_message
    ], 200);
  }


  public function getAvailableSiswaUnggulanProductDiscountCode(string $product_code, string $branch_code)
  {
    $selected_discount_code = null;
    $remaining_quota = 0;

    $discount_codes_response = $this->serviceDiscountCodeAffiliate->getAll($product_code);
    $discount_codes = json_decode($discount_codes_response->body())?->data;

    if (isset($discount_codes) && count($discount_codes) > 0) {
      $discount_code = collect($discount_codes)
        ->filter(function ($item) use ($product_code, $branch_code) {
          $isSystemOnly = $item->system_only == true;
          $isActive = $item->status == true;
          $isSpecificProduct = $item->usage_type == "SPECIFIC_PRODUCT";
          $isBranchDiscountCode = $item->identifier_type == "BRANCH" && $item->identifier == $branch_code;
          $isSiswaUnggulanDiscountCode = is_array($item->tags) && in_array("SISWA_UNGGULAN", $item->tags);
          $isProductDiscountCodeAvailable = count($item->discount_specific_product) > 0
            && collect($item->discount_specific_product)
            ->where("product_code", $product_code)
            ->count() > 0;
          $isDiscountCodeNotFullyUsed = count($item->history_usage_code) < $item->max_usage;
          return $isSystemOnly
            && $isActive
            && $isSpecificProduct
            && $isBranchDiscountCode
            && $isSiswaUnggulanDiscountCode
            && $isProductDiscountCodeAvailable
            && $isDiscountCodeNotFullyUsed;
        })
        ->values()
        ->toArray();
    }

    if (count($discount_code)) {
      $selected_discount_code = $discount_code[0]->code;
      $remaining_quota = $discount_code[0]->max_usage - count($discount_code[0]->history_usage_code);
    }

    return response()->json(['selected_discount_code' => $selected_discount_code, 'remaining_quota' => $remaining_quota], 200);
  }

  private function checkSiswaUnggulanDiscountEligibility(array $screening_results)
  {
    foreach ($screening_results as $result) {
      if (!$result) return false;
    }
    return true;
  }

  public function processSiplahTransaction(Request $request)
  {
    $user = Auth::user();
    if (!$user) {
      return response()->json([
        'data' => [
          "success" => false,
          'error' => 'auth user data was not found',
          'message' => "Silakan coba lagi"
        ]
      ], 422);
    }

    $payload = collect($request->all())->map(function ($item) {
      return $item;
    })->toArray();

    $payload["product_items"] = json_decode($payload["product_items"]);
    $payload["final_discount"] = (int)$payload["final_discount"];
    $payload["final_tax"] = (int)$payload["final_tax"];
    $payload["final_bill"] = (int)$payload["final_bill"];
    $payload["created_by"] = $user->name;

    // Add current transaction date (DD-MM-YYYY) to title payload value
    $currentDate = Carbon::now()->format("d-m-Y");
    $payload["title"] = $payload["title"] . " - " . $currentDate;

    $response = $this->serviceFinance->processSiplahTransaction($payload);
    if (isset($response->success) && $response->success) {
      return response()->json(['data' => $response->data], 201);
    }
    return response()->json(['data' => $response], 422);
  }

  public function processAssessmentProductTransaction(Request $request)
  {
    $user = Auth::user();
    if (!$user) {
      return response()->json([
        'data' => [
          "success" => false,
          'error' => 'auth user data was not found',
          'message' => "Silakan coba lagi"
        ]
      ], 422);
    }

    $payload = collect($request->all())->map(function ($item) {
      return $item;
    })->toArray();

    $payload["product_items"] = json_decode($payload["product_items"]);
    $payload["final_discount"] = (int)$payload["final_discount"];
    $payload["final_tax"] = (int)$payload["final_tax"];
    $payload["final_bill"] = (int)$payload["final_bill"];
    $payload["created_by"] = $user->name;

    // Add current transaction date (DD-MM-YYYY) to title payload value
    $currentDate = Carbon::now()->format("d-m-Y");
    $payload["title"] = $payload["title"] . " - " . $currentDate;

    $response = $this->serviceFinance->processAssessmentProductTransaction($payload);
    if (isset($response->success) && $response->success) {
      return response()->json(['data' => $response->data], 201);
    }
    return response()->json(['data' => $response], 422);
  }
}
