<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\LearningService\Student;
use App\Services\ProductService\Product;
use App\Services\ApiGatewayService\Internal;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ActivateStudentProduct extends Command
{
    private Internal $apiGatewayService;
    private Student $learningStudentService;
    private Product $productService;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'student:activate-video-material';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = "Send student's Video Material Product activation message via RabbitMQ (only for students that has SKD 48 Module online product)";

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct(
        Internal $apiGatewayService,
        Student $learningStudentService,
        Product $productService
    )
    {
        parent::__construct();
        $this->apiGatewayService = $apiGatewayService;
        $this->learningStudentService = $learningStudentService;
        $this->productService = $productService;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
      try {
        $now = Carbon::now()->format('Y-m-d H-i-s');
        echo "[{$now}] Starting activate student video material product command.... \n";

        $ids = $this->apiGatewayService->getAllStudentIds();
        foreach($ids as $id) {
          $now = Carbon::now()->format('Y-m-d H-i-s');
          $student = $this->learningStudentService->findStudent(['smartbtw_id' => $id]);

          if(!$student) {
            echo "[{$now}] Student's data with smartbtw_id {$id} is not found on learning service, skipping.... \n";
            continue;
          }

          $aop = $this->productService->getAOPPerStudent($id, 441, "skd");
          if(!$aop) {
            echo "[{$now}] {$student[0]->name} ({$id}) doesn't have SKD Premium 48 Modul, skipping.... \n";
            continue;
          }

          $material = $this->productService->getLearningMaterial($id, "skd", "VIDEO_MATERIAL");
          if($material) {
            echo "[{$now}] {$student[0]->name} ({$id}) already have video material, skipping.... \n";
            continue;
          }

          echo "[{$now}] Sending video material product activation message to {$student[0]->name} ({$id}).... \n";
          $bodyData = [
            "product_code" => "OL-SKD-448",
            "branch_code" => $student[0]->branch_code,
            "smartbtw_id" => $student[0]->smartbtw_id,
            "name" => $student[0]->name,
            "email" => $student[0]->email,
            "phone" => $student[0]->whatsapp_no,
            "status" => true,
            "date_activated" => $aop[0]->date_activated
          ];
          $this->productService->createActivation($bodyData);
        }

        echo "All video material product activation messages has been sent \n";
        return true;

      } catch(\Exception $e) {
        Log::error($e);
        echo $e;
        return false;
      }
    }
}
