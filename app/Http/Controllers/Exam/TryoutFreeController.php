<?php

namespace App\Http\Controllers\Exam;

use App\Helpers\Breadcrumb;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class TryoutFreeController extends Controller
{
  public function __construct()
  {
    Breadcrumb::setFirstBreadcrumb('Tryout Gratis', 'ujian/tryout-gratis');
  }

  public function index()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('/pages/exam/tryout-free/index', compact('breadcrumbs'));
  }

  public function showCreateForm()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Buat Tryout Gratis']];
    return view('/pages/exam/tryout-free/create', compact('breadcrumbs'));
  }

  public function showAddSessionForm()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah Sesi Tryout Gratis']];
    return view('/pages/exam/tryout-free/add-session', compact('breadcrumbs'));
  }

  public function detail()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Detail Tryout Gratis']];
    return view('/pages/exam/tryout-free/detail', compact('breadcrumbs'));
  }

  public function editPackage()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Tryout Gratis']];
    return view('/pages/exam/tryout-free/edit-package', compact('breadcrumbs'));
  }

  public function editCluster()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Sesi Tryout Gratis']];
    return view('/pages/exam/tryout-free/edit-cluster', compact('breadcrumbs'));
  }
}
