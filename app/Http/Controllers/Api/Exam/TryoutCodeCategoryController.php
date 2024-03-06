<?php

namespace App\Http\Controllers\Api\Exam;

use App\Http\Controllers\Controller;
use App\Services\ApiGatewayService\Internal;
use App\Services\ExamService\TryoutCodeCategory;
use Error;
use Illuminate\Http\Request;

class TryoutCodeCategoryController extends Controller
{
    private TryoutCodeCategory $tryoutCodeCategory;
    private Internal $internalService;

    public function __construct(TryoutCodeCategory $tryoutCodeCategory, Internal $serviceInternal)
    {
        $this->tryoutCodeCategory = $tryoutCodeCategory;
        $this->internalService = $serviceInternal;
    }

    public function getAll()
    {
        $response = $this->tryoutCodeCategory->getAll();
        $responseBody = json_decode($response->body());
        $responseStatus = $response->status();

        return response()->json($responseBody, $responseStatus);
    }

    public function getDetail($id)
    {
        $response = $this->tryoutCodeCategory->detail($id);
        $responseBody = json_decode($response->body());
        $responseStatus = $response->status();

        return response()->json($responseBody, $responseStatus);
    }

    public function getGroups($id)
    {
      $response = $this->tryoutCodeCategory->groups($id);
      $responseBody = json_decode($response->body());
      $responseStatus = $response->status();

      if($response->successful() && $responseBody?->data) {
        $groupedTryoutCodeGroup = collect($responseBody->data)
        ->groupBy("group")
        ->filter(fn($value, $key) => $key)
        ->map(function($key, $value) {
          $group = ["id" => $value, "text" => $value];
          return (object)$group;
        })
        ->sortBy('id')
        ->values()
        ->all();
        $responseBody->data = $groupedTryoutCodeGroup;
      }
      return response()->json($responseBody, $responseStatus);
    }

    public function create(Request $request)
    {
        $payload = $request->all();
        $response = $this->tryoutCodeCategory->save($payload);
        $responseBody = json_decode($response->body());
        $responseStatus = $response->status();

        if ($response->successful()) {
            $request->session()->flash('flash-message', [
                'title' => 'Berhasil!',
                'type' => 'success',
                'message' => 'Kategori Tryout Kode berhasil dibuat!'
            ]);
        }

        return response()->json($responseBody, $responseStatus);
    }

    public function update(Request $request)
    {
        $payload = $request->all();

        $response = $this->tryoutCodeCategory->update($payload);
        $responseBody = json_decode($response->body());
        $responseStatus = $response->status();

        if ($response->successful()) {
            $request->session()->flash('flash-message', [
                'title' => 'Berhasil!',
                'type' => 'success',
                'message' => 'Kategori Tryout Kode berhasil diperbarui!'
            ]);
        }

        return response()->json($responseBody, $responseStatus);
    }

    public function delete($id)
    {
        $response = $this->tryoutCodeCategory->delete($id);
        $responseBody = json_decode($response?->body());
        $responseStatus = $response->status();
        return response()->json($responseBody, $responseStatus);
    }
}
