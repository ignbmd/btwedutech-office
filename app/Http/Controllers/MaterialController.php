<?php

namespace App\Http\Controllers;

use App\Helpers\Breadcrumb;
use App\Helpers\UserRole;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\LearningService\Material;
use Illuminate\Support\Facades\Auth;

class MaterialController extends Controller
{
  private Material $materialService;

  public function __construct(Material $materialService)
  {
    $this->materialService = $materialService;
    Breadcrumb::setFirstBreadcrumb('Material', '/material');
  }

  public function index(Request $request)
  {
    $user = collect(Auth::user())->first();
    $allowed = UserRole::getAllowed('roles.material');
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
    ];
    return view('/pages/material/index', compact('breadcrumbs', 'allowed', 'user'));
  }

  public function add(Request $request)
  {
    $user = collect(Auth::user())->first();
    $allowed = UserRole::getAllowed('roles.material');
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
    ];
    return view(
      '/pages/material/add',
      compact('breadcrumbs', 'allowed', 'user')
    );
  }

  public function edit(Request $request, $materialId)
  {
    $user = collect(Auth::user())->first();
    $allowed = UserRole::getAllowed('roles.material');
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
    ];
    return view(
      '/pages/material/edit',
      compact('breadcrumbs', 'allowed', 'user', 'materialId')
    );
  }

  public function detail(Request $request, $materialId)
  {
    $allowed = UserRole::getAllowed('roles.material');
    $material = $this->materialService->getSingle($materialId);
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
    ];
    return view(
      '/pages/material/detail',
      compact('breadcrumbs', 'allowed', 'material')
    );
  }
}
