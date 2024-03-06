<?php
namespace App\Http\Controllers\InterestAndTalent;

use App\Helpers\Breadcrumb;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Request;
use App\Services\InterestAndTalentService\InterestAndTalent;

class ParticipantController extends Controller {

    private InterestAndTalent $interestAndTalentService;

    public function __construct(InterestAndTalent $interestAndTalentService)
    {
        $this->interestAndTalentService = $interestAndTalentService;
        Breadcrumb::setFirstBreadcrumb('Peminatan - Daftar Peserta', null);
    }
    public function index()
    {
        // Tampilan partisipan di halaman view
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true)];
        return view('pages.partisipant-list.index', compact('breadcrumbs'));
    }
    public function downloadReport($participant_id)
    {
        $response = $this->interestAndTalentService->getStudentResultPDFDownloadLink($participant_id);
        if (!$response->successful()) {
            return response()->json(['error' => 'Failed to retrieve PDF download link'], 400);
        } else {
            $pdfLink = json_decode($response)->data->download_link; 
            // Memecah URL menjadi komponen-komponen
            $parsedUrl = parse_url($pdfLink);

            // Mendapatkan path dari URL
            $path = $parsedUrl['path'];

            // Memecah path menjadi komponen-komponen
            $pathComponents = explode('/', $path);

            // Mendapatkan nilai yang diinginkan
            $filename = end($pathComponents);
            $pdfResult = json_decode($response)->data->download_link;    
            header('Content-Type: application/pdf');
            header('Content-Disposition: inline; filename="'.$filename.'"'); // Set desired filename
            readfile($pdfResult);

            exit();
        }
    }

}
