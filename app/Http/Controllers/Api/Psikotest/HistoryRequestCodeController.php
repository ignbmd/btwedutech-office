<?php

namespace App\Http\Controllers\Api\Psikotest;

use App\Http\Controllers\Controller;
use App\Services\PsikotestService\HistoryRequestCode;
use Illuminate\Http\Request;

use function GuzzleHttp\json_decode;

class HistoryRequestCodeController extends Controller
{
    private HistoryRequestCode $historyRequestCode;

    public function __construct(HistoryRequestCode $historyRequestCode)
    {
        $this->historyRequestCode = $historyRequestCode;
    }

    public function getAllCodeRequest()
    {
        $data = $this->historyRequestCode->getAll();
        return response()->json($data, 200);
    }
}