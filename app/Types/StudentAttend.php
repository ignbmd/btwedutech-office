<?php

namespace App\Types;

class StudentAttend
{
  public $name;
  public $parentPhone;
  public $status;
  public $smartbtwID;
  public $classScheduleID;
  public $createdByID;
  public $comment;

  public function isAttend()
  {
    return $this->status == 'ATTEND';
  }
}
