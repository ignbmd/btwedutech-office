<?php

namespace App\Http\Controllers\Api\NewAffiliate;

use App\Http\Controllers\Controller;
use App\Services\NewAffiliateService\Portion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AffiliatePortionController extends Controller
{
  private Portion $portion;
  private $errorMessage;

  public function __construct(Portion $portion)
  {
    $this->portion = $portion;
    $this->errorMessage = "Proses gagal, silakan coba lagi nanti";
  }

  public function getPortionByAffiliateId(int $affiliateId)
  {
    try{
      $response = $this->portion->getByAffiliateId($affiliateId);
      $body = json_decode($response?->body());
      $status = $response->status();
      return response()->json($body, $status);
    }catch(\Exception $e){
      Log::error(
        'Error when getting portion specific product by affiliate code',
        [
          'success' => false, 'message' => $e->getMessage()
        ]
      );
      return response()->json(['success' => false, 'message' => $this->errorMessage], 500);
    }
  }
}