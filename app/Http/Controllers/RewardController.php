<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\StagesService\Reward;

class RewardController extends Controller
{
  private Reward $rewardService;

  public function __construct(Reward $rewardService)
  {
    $this->rewardService = $rewardService;
  }

  public function index()
  {
    $breadcrumbs = [["name" => "Reward", "link" => null]];
    $rewardsResponse = $this->rewardService->getAll();
    $rewards = json_decode($rewardsResponse->body())?->data ?? [];
    return view('pages/reward/index', compact('breadcrumbs', 'rewards'));
  }

  public function create()
  {
    $breadcrumbs = [["name" => "Reward", "link" => "/reward"], ["name" => "Tambah Reward Baru", "link" => null]];
    $rewardTypes = ["COIN", "LEVEL", "STAGES", "CHANGEMAJOR"];
    $rarityTypes = ["RARE", "EPIC", "LEGEND"];
    return view('pages/reward/create', compact('breadcrumbs', 'rewardTypes', 'rarityTypes'));
  }

  public function edit(string $id)
  {
    $breadcrumbs = [["name" => "Reward", "link" => "/reward"], ["name" => "Edit Reward", "link" => null]];
    $rewardTypes = ["COIN", "LEVEL", "STAGES", "CHANGEMAJOR"];
    $rarityTypes = ["RARE", "EPIC", "LEGEND"];

    // Get reward data
    $rewardResponse = $this->rewardService->getByID($id);
    $reward = json_decode($rewardResponse->body())?->data ?? null;
    if(!$reward) return abort(404);

    return view('pages/reward/edit', compact('breadcrumbs', 'rewardTypes', 'rarityTypes', 'reward'));
  }

  public function store(Request $request)
  {
    $validation = Validator::make($request->all(), [
      'level_required' => 'required|numeric',
      'type' => 'required',
      'rarity' => 'required',
      'amount' => 'required|numeric',
      'description' => 'required',
    ], ['required' => 'Harus diisi', 'numeric' => 'Nilai tidak valid']);
    if($validation->fails()) return redirect()->back()->withErrors($validation)->withInput();
    $payload = array_merge(
      $request->except('_token'),
      [
        "amount" => (int)$request->amount,
        "level_required" => (int)$request->level_required,
        "code_name" => $request->has('code_name') ? $request->code_name : $request->type ."_". $request->amount,
      ]
    );
    $response = $this->rewardService->create($payload);
    $toast = $response->successful()
      ? ["title" => "Berhasil", "type" => "success", "message" => "Data reward berhasil ditambah"]
      : ["title" => "Terjadi kesalahan", "type" => "error", "message" => "Proses tambah data reward gagal, silakan coba lagi nanti"];
    $request->session()->flash('flash-message', [
      'title' => $toast["title"],
      'type' => $toast["type"],
      'message' => $toast["message"]
    ]);
    return redirect("/reward");
  }

  public function update(Request $request, string $id)
  {
    $validation = Validator::make($request->all(), [
      'level_required' => 'required|numeric',
      'rarity' => 'required',
      'amount' => 'required|numeric',
      'description' => 'required',
    ], ['required' => 'Harus diisi', 'numeric' => 'Nilai tidak valid']);
    if($validation->fails()) return redirect()->back()->withErrors($validation)->withInput();

    $payload = array_merge(
      $request->except('_token', '_method'),
      [
        "amount" => (int)$request->amount,
        "level_required" => (int)$request->level_required,
      ]
    );
    $response = $this->rewardService->update($id, $payload);
    $toast = $response->successful()
      ? ["title" => "Berhasil", "type" => "success", "message" => "Data reward berhasil diperbarui"]
      : ["title" => "Terjadi kesalahan", "type" => "error", "message" => "Proses ubah data reward gagal, silakan coba lagi nanti"];
    $request->session()->flash('flash-message', [
      'title' => $toast["title"],
      'type' => $toast["type"],
      'message' => $toast["message"]
    ]);
    return redirect("/reward");
  }




}
