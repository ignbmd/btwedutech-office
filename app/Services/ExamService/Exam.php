<?php

namespace App\Services\ExamService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class Exam extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.exam', '');
  }

  public function get(
    string $program = null,
    string $type = null,
    string $limit = '',
    string $pages = '',
    string $module_code = null,
    string $search = '',
    string $search_id = '',
    string $question_category_id = '',
  ) {
    $url = '/questions?search=' . $search;

    if ($program) {
      $url .= '&program=' . $program;
    }
    if ($type) {
      $url .= '&type=' . $type;
    }
    if ($limit) {
      $url .= '&limit=' . $limit;
    }
    if ($pages) {
      $url .= '&pages=' . $pages;
    }
    if ($module_code) {
      $url .= '&module_code=' . $module_code;
    }
    if ($search_id != null) {
      $url .= '&search_id=' . $search_id;
    }
    if ($question_category_id != null) {
      $url .= '&question_category_id=' . $question_category_id;
    }

    $response = $this->http->get(
      url: $url
    );
    return $response;
  }

  public function getById(string $id)
  {
    $response = $this->http->get(
      url: '/questions/' . $id
    );
    return $response;
  }

  public function saveQuestion(array $payload)
  {
    $response = $this->http->post(
      url: "/questions/many",
      data: ['data' => $payload]
    );
    return $response;
  }

  public function update(string $id, array $payload)
  {
    $response = $this->http->put(
      url: "/questions/" . $id,
      data: $payload
    );
    return $response;
  }

  public function connectQuestion(array $payload)
  {
    $response = $this->http->post(
      url: "/question/connect",
      data: $payload
    );
    return $response;
  }

  public function delete(string $id)
  {
    return $this->http->delete("/questions/{$id}");
  }

  public function recalculateIRT(array $payload)
  {
    return $this->http->post("record-answers/calculate-irt", data: $payload);
  }

  public function getQuestionDifficultyData($program, $module_code, $branch_code = null)
  {
    return $this->http->get("/client/explanation/student-question-difficulty", ["program" => $program, "module_code" => $module_code, "branch_code" => $branch_code]);
  }

  public function getQuestionComments($question_id)
  {
    return $this->http->get("/client/explanation/mentor-comment-explanation/$question_id");
  }
}
