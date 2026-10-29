<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $t) {
            $t->id();
            $t->string('room_no')->unique();
            $t->string('type');
            $t->unsignedInteger('rent');
            $t->unsignedInteger('capacity');
            $t->timestamps();
        });
        Schema::create('tenants', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('phone');
            $t->foreignId('room_id')->constrained()->cascadeOnDelete();
            $t->date('joined_on');
            $t->timestamps();
        });
        Schema::create('payments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $t->unsignedInteger('amount');
            $t->string('month');
            $t->string('status');
            $t->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('tenants');
        Schema::dropIfExists('rooms');
    }
};
