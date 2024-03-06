<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\ApiGatewayService\Internal\Tryout;

class TryoutController extends Controller
{
  private Tryout $tryout;

  public function __construct(Tryout $tryout)
  {
    $this->tryout = $tryout;
  }

  public function getFreeTryoutSection(Request $request)
  {
    return $this->tryout->getFreeTryoutSection($request->all());
  }

  public function getPremiumTryoutSection(Request $request)
  {
    return $this->tryout->getPremiumTryoutSection($request->all());
  }

  public function getPackageTryoutSection(Request $request)
  {
    return $this->tryout->getPackageTryoutSection($request->all());
  }

  public function getSpecificTryoutSection(Request $request)
  {
    return $this->tryout->getSpecificTryoutSection($request->all());
  }
}
