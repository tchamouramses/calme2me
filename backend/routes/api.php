<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\CommentReactionController;
use App\Http\Controllers\Api\RejectedMessageController;
use App\Http\Controllers\Api\ProblemController;
use App\Http\Controllers\Api\ProblemReactionController;
use Illuminate\Support\Facades\Route;
Route::post('/problems', [ProblemController::class, 'store'])->middleware('suspension');
// Auth routes
Route::post('/problems/{problem}/comments', [CommentController::class, 'store'])->middleware('suspension');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

// Public routes
Route::get('/problems', [ProblemController::class, 'index']);
Route::get('/problems/{problem:uuid}', [ProblemController::class, 'show']);
Route::post('/problems', [ProblemController::class, 'store']);
    Route::post('/admin/rejections/{rejectedMessage}/suspend', [RejectedMessageController::class, 'suspend']);
Route::get('/problems/{problem}/comments', [CommentController::class, 'index']);
Route::post('/problems/{problem}/comments', [CommentController::class, 'store']);
Route::post('/problems/{problem}/reactions', [ProblemReactionController::class, 'toggle']);
Route::post('/comments/{comment}/reactions', [CommentReactionController::class, 'toggle']);

// Admin routes (protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/admin/problems', [ProblemController::class, 'adminIndex']);
    Route::get('/admin/rejections', [RejectedMessageController::class, 'index']);
    Route::patch('/problems/{problem}/status', [ProblemController::class, 'updateStatus']);
    Route::delete('/problems/{problem}', [ProblemController::class, 'destroy']);
});
