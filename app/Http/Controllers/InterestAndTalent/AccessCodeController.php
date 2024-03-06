<?php
namespace App\Http\Controllers\InterestAndTalent;

use App\Helpers\Breadcrumb;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Request;

class AccessCodeController extends Controller {

    public function __construct()
    {
        Breadcrumb::setFirstBreadcrumb('Peminatan - Riwayat Request Kode Akses', null);
    }

    public function requestHistory()
    {
        // Tampilan partisipan di halaman view
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true)];
        return view('pages.history-request-code.index', compact('breadcrumbs'));
    }
}
