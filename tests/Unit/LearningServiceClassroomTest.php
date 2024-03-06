<?php

namespace Tests\Unit;

use App\Services\LearningService\ClassRoom;
use Tests\TestCase;

class LearningServiceClassroomTest extends TestCase
{
    /**
     * Test if return throw if connection address is not set
     */
    public function test_set_connection()
    {
        if(!config("services.btw.learning")) {
            $this->expectException("Exception");
        }
        $t = new ClassRoom();
        $this->assertTrue($t->ping());
    }

    public function test_create_class_room()
    {
        $t = new ClassRoom();
        $t->createClassRoom(
            title: "KELAS B01",
            branchCode: "TA001",
            quota: 50,
            description: "Ini description",
            product: "01");
    }

}
