<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RejectedMessage;
use Illuminate\Http\Request;

class RejectedMessageController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 20);

        return RejectedMessage::query()
            ->with('problem')
            ->latest()
            ->paginate($perPage);
    }
}
