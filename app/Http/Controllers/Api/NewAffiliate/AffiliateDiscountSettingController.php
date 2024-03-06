<?php

namespace App\Http\Controllers\Api\NewAffiliate;

use App\Http\Controllers\Controller;
use App\Services\NewAffiliateService\DiscountSpecificProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AffiliateDiscountSettingController extends Controller
{
  private DiscountSpecificProduct $discountSpecificProduct;
  private $errorMessage;

  public function __construct(DiscountSpecificProduct $discountSpecificProduct)
  {
    $this->discountSpecificProduct = $discountSpecificProduct;
    $this->errorMessage = "Proses gagal, silakan coba lagi nanti";
  }

  public function getByAffiliateCode(string $affiliateCode)
  {
    try {
      $response = $this->discountSpecificProduct->getByAffiliateCode($affiliateCode);
      $body = json_decode($response?->body());
      $status = $response->status();
      return response()->json($body, $status);
    } catch (\Exception $e) {
      Log::error(
        'Error when getting discount specific product by affiliate code',
        [
          'success' => false, 'message' => $e->getMessage()
        ]
      );
      return response()->json(['success' => false, 'message' => $this->errorMessage], 500);
    }
  }
}
