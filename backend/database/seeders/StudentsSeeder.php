<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentsSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'student@example.com'],
            [
                'fname' => 'John',
                'lname' => 'Doe',
                'birth_date' => '2000-01-01',
                'gender' => 'male',
                'password' => Hash::make('password'),
                'phone' => '0123456789',
                'role' => 'student',
                'department_id' => 1,
            ]
        );
    }
}