<?php

namespace App\Services\StudyMaterialService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class Material extends Service implements ServiceContract
{
  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.study_material', '');
  }

  public function getAll($query = [])
  {
    $query = array_filter($query);
    $response = $this->http->get(url: '/admin/materials', query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getByIds(array $material_ids)
  {
    $data = ['material_ids' => $material_ids];
    $response = $this->http->post(url: '/admin/materials/ids', data: $data);
    $materials = json_decode($response?->body());
    return $materials?->data ?? [];
  }
}
