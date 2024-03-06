<?php

namespace App\Helpers;

class Product
{
  public static function filterSiplahProducts(array $params)
  {
    $request = $params["request"];
    $data = collect($params["data"])
      ->filter(fn ($item) => str_contains(strtoupper($item->product_code), strtoupper("SIPLAH")));

    if ($request->has('title') && $request->title) {
      $data = $data->filter(fn ($item) => str_contains(strtolower($item->title), strtolower($request->title)));
    }

    if ($request->has('tags') && $request->tags) {
      $tags = explode(",", $request->tags);
      $data = $data
        ->filter(function ($item) use ($tags) {
          return collect($item->tags)->contains(function ($tag) use ($tags) {
            return in_array($tag, $tags);
          });
        });
    }

    return $data->values()->toArray();
  }

  public static function filterAssessmentProducts(array $params)
  {
    $request = $params["request"];
    $data = collect($params["data"])
      ->filter(fn ($item) => !str_contains(strtoupper($item->product_code), strtoupper("SIPLAH")));

    if ($request->has('title') && $request->title) {
      $data = $data->filter(fn ($item) => str_contains(strtolower($item->title), strtolower($request->title)));
    }

    if ($request->has('tags') && $request->tags) {
      $tags = explode(",", $request->tags);
      $data = $data
        ->filter(function ($item) use ($tags) {
          return collect($item->tags)->contains(function ($tag) use ($tags) {
            return in_array($tag, $tags);
          });
        });
    }

    return $data->values()->toArray();
  }
}
