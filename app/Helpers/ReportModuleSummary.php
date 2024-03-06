<?php

namespace App\Helpers;

use stdClass;
use App\Services\ProfileService\Profile;

class ReportModuleSummary
{
    // public static function modifySummaryData($results, $taskids_group, $members)
    public static function modifySummaryData($results, $taskids_group, $members)
    {
        $existStudentIds = [];
        $getManyScorePayload = [];
        $scoreBKN = [];

        /*
            Filter the $results and combine $taskids_group to get final value of student filtered score.
            This will include Skor BKN from service Profile, Tryout skor from ExamResult ($results)
        */

        // Check if results data of the students are not empty
        if ($results['data']) {
            foreach ($results['data'] as $result) {
                $existStudentIds[] = $result->student->smartbtw_id;
            }

            $getManyScorePayload['smartbtw_id'] = $existStudentIds;
            if (isset($results['class_year'])) {
                $getManyScorePayload['year'] = $results['class_year'];
                $profileService = new Profile();
                $getManyScoreResults = $profileService->getManyScore($getManyScorePayload);
                if ($getManyScoreResults) {
                    foreach ($getManyScoreResults as $scoreResults) {
                        $scoreBKN[$scoreResults->student_datas->smartbtw_id] = new stdClass();
                        $scoreBKN[$scoreResults->student_datas->smartbtw_id]->TWK = $scoreResults->score_twk;
                        $scoreBKN[$scoreResults->student_datas->smartbtw_id]->TIU = $scoreResults->score_tiu;
                        $scoreBKN[$scoreResults->student_datas->smartbtw_id]->TKP = $scoreResults->score_tkp;
                        $scoreBKN[$scoreResults->student_datas->smartbtw_id]->SKD = $scoreResults->score_skd;
                    }
                }
            }

            $emptyStudentReport = [];
            foreach ($members as $value) {
                if (!in_array($value->smartbtw_id, $existStudentIds)) {
                    $emptyStudentReport[] = $value;
                }
            }

            $results['group'] = [];
            $scoreKeys = null;

            $results['all_diff'] = [];
            $results['all_diff']["TWK"] = [];
            $results['all_diff']["TIU"] = [];
            $results['all_diff']["TKP"] = [];
            $results['all_diff']["SKD"] = [];

            $results['filtered_results'] = new stdClass();
            if ($results['data']) {
                foreach ($results['data'] as $value) {
                    $results['filtered_results']->{$value->student->smartbtw_id} = array();
                }

                foreach ($emptyStudentReport as $student) {
                    $results['filtered_results']->{$student->smartbtw_id} = array();
                    $emptyReport = new stdClass();
                    $emptyReport->report = [];
                    $emptyReport->student = $student;
                    array_push($results['data'], $emptyReport);
                }
            }

            $grouped_code_tryout_category = $taskids_group->groupBy('group');
            $grouped_code_tryout_category = $grouped_code_tryout_category->map(function ($group) {
                return $group->pluck('title', 'task_id')->sort()->all();
            });
            foreach ($grouped_code_tryout_category as $groups => $groupValue) {
                $task_ids = array_keys($groupValue);
                $new_group = new stdClass();
                $new_group->group = $groups;
                $new_group->task_id = [];
                $new_group->title = $groupValue[$task_ids[0]];
                foreach ($results['data'] as $data) {
                    $data->average = new stdClass();
                    $data->score_bkn = new stdClass();

                    if ($scoreBKN) {
                        $data->score_bkn = $scoreBKN[$data->student->smartbtw_id] ?? null;
                    } else {
                        $data->score_bkn = null;
                    }

                    if (isset($data->report)) {
                        $studentReport = collect($data->report)->filter(function ($report) use ($task_ids) {
                            return in_array($report->task_id, $task_ids);
                        })->sortBy('task_id')->last();
                        if ($studentReport) {
                            $new_group->task_id[$data->student->smartbtw_id] = $studentReport->task_id;
                            $data->all_score = new stdClass();

                            $sumAverage = 0.0;
                            foreach ($data->subject->score_keys as $keys) {
                                $sumAverage = $data->subject->score_values->$keys->average_score + $sumAverage;
                                $data->average->{$keys} = $data->subject->score_values->$keys->average_score;
                            }
                            $data->average->SKD = $sumAverage;
                            $sumScore = 0.0;

                            $data->all_score->TWK = new stdClass();
                            $data->all_score->TIU = new stdClass();
                            $data->all_score->TKP = new stdClass();
                            $data->all_score->SKD = new stdClass();

                            $data->all_score->TWK->average = $data->average->TWK;
                            $data->all_score->TIU->average = $data->average->TIU;
                            $data->all_score->TKP->average = $data->average->TKP;
                            $data->all_score->SKD->average = $data->average->SKD;

                            if (count((array)$data->score_bkn) > 0) {
                                $data->all_score->TWK->score_bkn = $data->score_bkn->TWK;
                                $data->all_score->TIU->score_bkn = $data->score_bkn->TIU;
                                $data->all_score->TKP->score_bkn = $data->score_bkn->TKP;
                                $data->all_score->SKD->score_bkn = $data->score_bkn->SKD;

                                $data->all_score->TWK->diff = $data->all_score->TWK->average - $data->all_score->TWK->score_bkn;
                                $data->all_score->TIU->diff = $data->all_score->TIU->average - $data->all_score->TIU->score_bkn;
                                $data->all_score->TKP->diff = $data->all_score->TKP->average - $data->all_score->TKP->score_bkn;
                                $data->all_score->SKD->diff = $data->all_score->SKD->average - $data->all_score->SKD->score_bkn;
                            } else {
                                $data->all_score->TWK->score_bkn = null;
                                $data->all_score->TIU->score_bkn = null;
                                $data->all_score->TKP->score_bkn = null;
                                $data->all_score->SKD->score_bkn = null;

                                $data->all_score->TWK->diff = null;
                                $data->all_score->TIU->diff = null;
                                $data->all_score->TKP->diff = null;
                                $data->all_score->SKD->diff = null;
                            }

                            foreach ($studentReport->score as $score) {
                                $sumScore = $score->score + $sumScore;
                                $results['filtered_results']->{$data->student->smartbtw_id}[$studentReport->task_id][$score->category] = $score->score;
                            }
                            $results['filtered_results']->{$data->student->smartbtw_id}[$studentReport->task_id]['SKD'] = $sumScore;
                            if (!$scoreKeys) {
                                $scoreKeys = $studentReport->score_keys;
                            }
                        } else {
                            $results['filtered_results']->{$data->student->smartbtw_id}[$task_ids[0]] = null;
                            $data->average = null;
                        }
                    } else {
                        $data->average = null;
                    }
                    $new_group->score_keys = $scoreKeys;
                }
                array_push($results['group'], $new_group);
            }
            $total_sum_average = array_map(function ($siswa) {
                $averageSum = ["TWK" => 0, "TIU" => 0, "TKP" => 0, "SKD" => 0];
                if (isset($siswa->average) && count((array) $siswa->average) > 0) {
                    $averageSum["TWK"] += $siswa->average->TWK;
                    $averageSum["TIU"] += $siswa->average->TIU;
                    $averageSum["TKP"] += $siswa->average->TKP;
                    $averageSum["SKD"] += $siswa->average->SKD;
                }
                return $averageSum;
            }, $results['data']);

            $student_count = count(array_filter($results['data'], function ($item) {
                return isset($item->average);
            }));

            $results['total_sum_average'] = new stdClass();
            $results['total_sum_average']->TWK = new stdClass();
            $results['total_sum_average']->TIU = new stdClass();
            $results['total_sum_average']->TKP = new stdClass();
            $results['total_sum_average']->SKD = new stdClass();

            $results['total_sum_average']->TWK->score_bkn = (count($scoreBKN) > 0 ?  round(array_sum(array_column($scoreBKN, 'TWK')) / count($scoreBKN), 2) : null);
            $results['total_sum_average']->TIU->score_bkn = (count($scoreBKN) > 0 ?  round(array_sum(array_column($scoreBKN, 'TIU')) / count($scoreBKN), 2) : null);
            $results['total_sum_average']->TKP->score_bkn = (count($scoreBKN) > 0 ?  round(array_sum(array_column($scoreBKN, 'TKP')) / count($scoreBKN), 2) : null);
            $results['total_sum_average']->SKD->score_bkn = (count($scoreBKN) > 0 ?  round(array_sum(array_column($scoreBKN, 'SKD')) / count($scoreBKN), 2) : null);

            if ($student_count) {
                $results['total_sum_average']->TWK->average = round(array_sum(array_column($total_sum_average, 'TWK')) / $student_count, 2);
                $results['total_sum_average']->TIU->average = round(array_sum(array_column($total_sum_average, 'TIU')) / $student_count, 2);
                $results['total_sum_average']->TKP->average = round(array_sum(array_column($total_sum_average, 'TKP')) / $student_count, 2);
                $results['total_sum_average']->SKD->average = round(array_sum(array_column($total_sum_average, 'SKD')) / $student_count, 2);
            }

            usort($results['group'], function ($a, $b) {
                return $a->group > $b->group ? 1 : -1;
            });
        }

        if ($results['data']) {
            foreach ($results['data'] as $siswa) {
                if (isset($siswa->all_score) && count((array)$siswa->all_score->TWK) > 0) {
                    array_push($results['all_diff']['TWK'], $siswa->all_score->TWK->diff);
                    array_push($results['all_diff']['TIU'], $siswa->all_score->TIU->diff);
                    array_push($results['all_diff']['TKP'], $siswa->all_score->TKP->diff);
                    array_push($results['all_diff']['SKD'], $siswa->all_score->SKD->diff);
                }
            }

            $count_diff = count(array_filter($results['all_diff']['TWK'], function ($value) {
                return !empty($value);
            }));

            if ($count_diff > 0) {
                $results['all_diff']['TWK'] = round(array_sum($results['all_diff']['TWK']) / $count_diff, 2);
                $results['all_diff']['TIU'] = round(array_sum($results['all_diff']['TIU']) / $count_diff, 2);
                $results['all_diff']['TKP'] = round(array_sum($results['all_diff']['TKP']) / $count_diff, 2);
                $results['all_diff']['SKD'] = round(array_sum($results['all_diff']['SKD']) / $count_diff, 2);

                $results['total_sum_average']->TWK->diff = $results['all_diff']['TWK'];
                $results['total_sum_average']->TIU->diff = $results['all_diff']['TIU'];
                $results['total_sum_average']->TKP->diff = $results['all_diff']['TKP'];
                $results['total_sum_average']->SKD->diff = $results['all_diff']['SKD'];
            } else {
                $results['all_diff']['TWK'] = null;
                $results['all_diff']['TIU'] = null;
                $results['all_diff']['TKP'] = null;
                $results['all_diff']['SKD'] = null;
            }
        }

        /*
            Below are foreach loop to init value for all tryout average from the $results['filtered_results']
        */
        $tryout_group = new stdClass();
        $results['all_tryout_group'] = new stdClass();

        // check if filtered_results have been created
        if (array_key_exists('filtered_results', $results)) {
            foreach ($results['filtered_results'] as $filtered) {
                foreach ($filtered as $filterValue_key => $filterValue) {
                    $tryout_group->{$filterValue_key} = array();
                    $tryout_group->{$filterValue_key}['TWK'] = array();
                    $tryout_group->{$filterValue_key}['TIU'] = array();
                    $tryout_group->{$filterValue_key}['TKP'] = array();
                    $tryout_group->{$filterValue_key}['SKD'] = array();
                }
            }

            foreach ($results['filtered_results'] as $filtered) {
                foreach ($filtered as $filterValue_key => $filterValue) {
                    if ($filterValue) {
                        array_push($tryout_group->{$filterValue_key}['TWK'], $filterValue['TWK']);
                        array_push($tryout_group->{$filterValue_key}['TIU'], $filterValue['TIU']);
                        array_push($tryout_group->{$filterValue_key}['TKP'], $filterValue['TKP']);
                        array_push($tryout_group->{$filterValue_key}['SKD'], $filterValue['SKD']);
                    }
                }
            }

            foreach ($results['filtered_results'] as $filtered) {
                foreach ($filtered as $filterValue_key => $filterValue) {
                    if ($filterValue) {
                        $results['all_tryout_group']->{$filterValue_key}['TWK'] = is_float(array_sum($tryout_group->{$filterValue_key}['TWK']) / count($tryout_group->{$filterValue_key}['TWK'])) ? round(array_sum($tryout_group->{$filterValue_key}['TWK']) / count($tryout_group->{$filterValue_key}['TWK']), 2) : array_sum($tryout_group->{$filterValue_key}['TWK']) / count($tryout_group->{$filterValue_key}['TWK']);
                        $results['all_tryout_group']->{$filterValue_key}['TIU'] = is_float(array_sum($tryout_group->{$filterValue_key}['TIU']) / count($tryout_group->{$filterValue_key}['TIU'])) ? round(array_sum($tryout_group->{$filterValue_key}['TIU']) / count($tryout_group->{$filterValue_key}['TIU']), 2) : array_sum($tryout_group->{$filterValue_key}['TIU']) / count($tryout_group->{$filterValue_key}['TIU']);
                        $results['all_tryout_group']->{$filterValue_key}['TKP'] = is_float(array_sum($tryout_group->{$filterValue_key}['TKP']) / count($tryout_group->{$filterValue_key}['TKP'])) ? round(array_sum($tryout_group->{$filterValue_key}['TKP']) / count($tryout_group->{$filterValue_key}['TKP']), 2) : array_sum($tryout_group->{$filterValue_key}['TKP']) / count($tryout_group->{$filterValue_key}['TKP']);
                        $results['all_tryout_group']->{$filterValue_key}['SKD'] = is_float(array_sum($tryout_group->{$filterValue_key}['SKD']) / count($tryout_group->{$filterValue_key}['SKD'])) ? round(array_sum($tryout_group->{$filterValue_key}['SKD']) / count($tryout_group->{$filterValue_key}['SKD']), 2) : array_sum($tryout_group->{$filterValue_key}['SKD']) / count($tryout_group->{$filterValue_key}['SKD']);
                    }
                }
            }
        }
        return $results;
    }
}
