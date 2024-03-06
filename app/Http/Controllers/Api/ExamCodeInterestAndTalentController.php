<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\InterestAndTalentService\InterestAndTalent;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Myerscode\Laravel\ApiResponse\Body;

class ExamCodeInterestAndTalentController extends Controller
{
  private InterestAndTalent $interestAndTalentService;

  public function __construct(InterestAndTalent $interestAndTalentService)
  {
      $this->interestAndTalentService = $interestAndTalentService;
  }
  public function downloadResult($code)
  {
    //Get Semua data Student Result
    $branchCode = Auth::user()->branch_code;
    $studentResult = $this->interestAndTalentService->getStudentResult($branchCode);

    if(count($studentResult) === 0 ){
      return response()->json(['status' => 500, 'message' => 'Data siswa tidak ditemukan'], 500);
    }

    // filter data berdasarkan exam_code
    $selectedResult = collect($studentResult)
    ->where('code', $code)
    ->values()
    ->first();
    if(!$selectedResult){
      return response()->json(['status' => 500, 'message' => 'Data siswa tidak ditemukan'],500);
    }    
    
    $participantId = $selectedResult->_id;
    $downloadLink = $this->interestAndTalentService->getStudentResultPDFDownloadLink($participantId);
    $body = json_decode($downloadLink->body());
    $status = $downloadLink->status();
    return response()->json($body, $status,);
  }
}