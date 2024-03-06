<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Helpers\UserRole;
use App\Helpers\Bill;
use App\Helpers\Breadcrumb;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('acl');
        Breadcrumb::setFirstBreadcrumb('Dashboard UKA', '/dashboard-uka');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        $isKeuanganUser = UserRole::isKeuangan();
        $unpaidBills = Bill::getAllBranchesUnpaidPastDueDateBills();
        return view('pages/home', compact('isKeuanganUser', 'unpaidBills'));
    }
    
    public function ukaIndex()
    {
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
        return view('pages/dashboard-uka/index', compact('breadcrumbs'));
    }
}
