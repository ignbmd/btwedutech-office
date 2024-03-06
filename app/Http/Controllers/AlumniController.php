<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\Breadcrumb;
use App\Services\AlumniService\Alumni;

class AlumniController extends Controller
{
  private Alumni $alumniService;

  public function __construct(Alumni $alumniService)
  {
    Breadcrumb::setFirstBreadcrumb('Alumni', 'alumni');
    $this->alumniService = $alumniService;
  }

  public function index()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('/pages/alumni/index', compact('breadcrumbs'));
  }

  public function create()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah Alumni']];
    return view('pages/alumni/create', compact('breadcrumbs'));
  }

  public function detail($program, $selection, $id)
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Detail Alumni']];
    $response = $this->alumniService->getByID($program, $selection, $id);
    $responseBody = json_decode($response?->body());
    $alumni = $responseBody->data ?? [];
    if(!$alumni) {
      return redirect('/alumni')->with('flash-message', [
        'title' => 'Data tidak ditemukan',
        'type' => 'warning',
        'message' => 'Data alumni tidak ditemukan'
      ]);
    }
    return view('pages/alumni/detail', compact('breadcrumbs', 'alumni', 'program', 'selection', 'id'));
  }

  public function edit($program, $selection, $id)
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Alumni']];
    return view('pages/alumni/edit', compact('breadcrumbs'));
  }
}
