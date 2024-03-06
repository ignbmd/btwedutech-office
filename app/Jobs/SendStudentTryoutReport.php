<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Barryvdh\Snappy\Facades\SnappyPdf;
use Illuminate\Support\Facades\Storage;
use App\Helpers\RabbitMq;
use App\Services\StudentResultService\ClassroomResult;
use Throwable;

class SendStudentTryoutReport implements ShouldQueue
{
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

  public $student;
  public $classroom;

  public $uniqueFor = 60;

  /**
   * Create a new job instance.
   *
   * @return void
   */
  public function __construct($student)
  {
    $this->student = $student;
  }

  /**
   * Execute the job.
   *
   * @return void
   */
  public function handle(ClassroomResult $classroomResult)
  {
    try {
      $studentResult = $classroomResult->getSummary([$this->student->smartbtw_id], 'skd', env('SEND_STUDENT_REPORT_TYPE'));
      if($studentResult) {
        $startDate = Carbon::now()->subWeek()->format('Y-m-d');
        $endDate = Carbon::now()->format('Y-m-d');
        $program = 'skd';
        $payload = [
          'user' => $this->student,
          'report' => $studentResult[0],
          'program' => $program,
          'program_title' => implode(' ', explode('-', $program)),
          'start_date' => $startDate,
          'end_date' => $endDate,
          'is_last_week_report' => false
        ];
        $html = view('pages.student-result.print-tryout-report', $payload);
        $pdf  = SnappyPdf::loadHTML($html)
        ->setPaper('a4')
        ->setOption('margin-top', 0)
        ->setOption('margin-left', 0)
        ->setOption('margin-right', 0)
        ->setOption('margin-bottom', 0);
        $jam = Carbon::now()->hour;

        if($jam > 6 && $jam <= 11){
            $salam = "Selamat pagi";
        } elseif($jam >= 12 && $jam <= 14){
            $salam = "Selamat siang";
        } elseif($jam >= 15 && $jam <= 18){
            $salam = "Selamat Sore";
        } else{
            $salam = "Selamat Malam";
        }
        $formattedUserName = preg_replace('/[^A-Za-z0-9\-]/', '', $this->student->name);
        $removeEndSpaceName = preg_replace('/\s\Z/', '', $this->student->name);

        $postfix = date('YmdHis');
        $fileName = "report_{$formattedUserName}_{$postfix}.pdf";
        $uploadPath = "/uploads/office/tryout-report/$fileName";
        $fileUrl = env('AWS_URL') . $uploadPath;
        Storage::disk('s3')->put($uploadPath, $pdf->output());

        $bodyMessageWA = "*(BIMBEL BTW)*
".$salam." Bapak/Ibu orangtua siswa *".$removeEndSpaceName."*. Berikut kami kirimkan file pdf raport pengerjaan modul a/n. *".$removeEndSpaceName."*. Mohon kerjasama Bapak/Ibu untuk ikut memantau perkembangan hasil belajar putra/putri nya.
Terimakasih.
_*NB*: Informasi ini dikirim secara otomatis oleh sistem dari aplikasi *smartbtw*._\n
_Mohon untuk tidak membalas pesan ini._";

        RabbitMq::send('message-gateway.wa.created', json_encode([
          'version' => 1,
          'data' => [
            'phone_number' => $this->student->parent_phone,
            'message_title' => 'Laporan Hasil Perkembangan Belajar SKD',
            'message_body' => $bodyMessageWA,
            'message_type' => 'REG',
            'date_send' => Carbon::now()->toISOString(),
          ]
        ]));

        RabbitMq::send('message-gateway.wa-file.created', json_encode([
          'version' => 1,
          'data' => [
            'phone_number' => $this->student->parent_phone,
            'message_title' => 'Laporan Hasil Perkembangan Belajar SKD',
            'file_name' => $fileName,
            'url_file' => $fileUrl,
            'caption' => $fileName,
            'date_send' => Carbon::now()->toISOString(),
          ]
        ]));
      }
    } catch (\Exception $e) {
      return $this->fail(throw new \Exception($e));
    }
  }

  public function failed(Throwable $exception)
  {
    Log::error($exception);
  }

}
