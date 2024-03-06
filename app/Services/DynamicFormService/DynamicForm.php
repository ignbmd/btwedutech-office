<?php

namespace App\Services\DynamicFormService;

use App\Services\Service;
use App\Services\Traits\HasBranch;
use App\Services\ServiceContract;

class DynamicForm extends Service implements ServiceContract
{

    use HasBranch;

    protected function serviceAddress(): string
    {
        return config('services.btw.dynamic_form','');
    }

    public function getAll(){
        $response = $this->http->get(
            url: "/forms/get-all",
        );
        $data = json_decode($response?->body());
        return $data;
        // return $response;
    }

    public function getSingleById($id){
        $response = $this->http->get(
            url: "forms/get-single/" . $id
        );
        $data = json_decode($response?->body());
        return $data;    
    }

    public function create(array $payload){
        $response = $this->http->post(
            url:"/forms",
            data: $payload
        );
        $data = json_decode($response?->body());
        return $data;
    }
    
    public function update(array $payload, string $id){
        $response = $this->http->put(
            url:"/forms/$id",
            data: $payload
        );
        $data = json_decode($response?->body());
        return $data;
    }

    public function getSingleByFormId($id)
    {
        $response = $this->http->get(
            url: "/records/get-by-form-id/" . $id
        );
        $data = json_decode($response?->body());
        return $data; 
        
    }
}