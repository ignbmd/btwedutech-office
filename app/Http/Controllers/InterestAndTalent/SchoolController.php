<?php

namespace App\Http\Controllers\InterestAndTalent;

use App\Helpers\UserRole;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SchoolController extends Controller
{
  public function index()
  {
    $breadcrumbs = [["name" => "Peminatan - MOU Sekolah BTW"]];
    return view('pages.interest-and-talent.school.index', compact('breadcrumbs'));
  }

  public function detail($school_id)
  {
    $allowedActions = UserRole::getAllowed('roles.interest_and_talent');
    $breadcrumbs = [["name" => "Peminatan - MOU Sekolah BTW", "link" => "/peminatan/sekolah"], ["name" => "Detail Sekolah"]];
    return view('pages.interest-and-talent.school.detail', compact('breadcrumbs', 'allowedActions'));
  }
}
