<?php

namespace App\Http\Controllers\Utility;

use App\Http\Controllers\Controller;
use App\Helpers\RabbitMq;
use App\Helpers\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RabbitMqController extends Controller
{
  public function showPublishMessageForm()
  {
    $this->middleware('acl');
    $allowedRoles = UserRole::getAllowed("roles.utility");
    $isAuthorized = in_array("rabbitmq.publish_message", $allowedRoles);
    if(!$isAuthorized) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Anda tidak diperbolehkan mengakses halaman ini'
      ]);
      return redirect('/home');
    }
    $breadcrumbs = [["name" => "Utility - Publish RabbitMQ Message", "link" => null]];
    return view("/pages/utility/rabbitmq/publish-message-form", compact('breadcrumbs'));
  }

  public function publishMessage(Request $request)
  {
    $validator = Validator::make($request->all(), [
      "key" => 'required',
      "payload" => 'required|json'
    ], [
      "key.required" => "Routing key is required",
      "payload.required" => "Payload is required",
      "payload.json" => "Payload is an invalid json string"
    ]);
    if($validator->fails()) return redirect()->back()->withErrors($validator)->withInput();
    RabbitMq::send($request->key, json_encode(json_decode($request->payload)));
    return redirect()->back()->with("flash-message", ['title' => 'Success!', 'type' => 'success', 'message' => 'Message published']);
  }
}
