<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InitialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();

        // Users (using provided hashed passwords) - insert or update if exists
        DB::table('users')->updateOrInsert(
            ['email' => 'admin@system.com'],
            [
                'fname' => 'System',
                'lname' => 'Admin',
                'birth_date' => '1990-01-01',
                'gender' => 'male',
                'password' => '$2y$12$P.EwMMrgRnf5qZXXtWLWI.DLH5U1upEv5SLETtlO88oEShMhfYLqa',
                'phone' => '0698765432',
                'role' => 'admin',
                'image' => null,
                'updated_at' => $now,
                'created_at' => DB::raw('COALESCE(created_at, NOW())'),
            ]
        );

        DB::table('users')->updateOrInsert(
            ['email' => 'employee@system.com'],
            [
                'fname' => 'Office',
                'lname' => 'Employee',
                'birth_date' => '1995-01-01',
                'gender' => 'female',
                'password' => '$2y$12$.tVa3y3AqP7tyXV97g4UVOz.pw1PY/jjV0KegiQr/2C2.s.K.w4mW',
                'phone' => null,
                'role' => 'employee',
                'image' => null,
                'updated_at' => $now,
                'created_at' => DB::raw('COALESCE(created_at, NOW())'),
            ]
        );

        // Settings
        // Settings - associate with actual user IDs
        $adminId = DB::table('users')->where('email', 'admin@system.com')->value('id');
        if ($adminId) {
            DB::table('settings')->updateOrInsert(
                ['user_id' => $adminId],
                [
                    'theme' => 'dark',
                    'language' => 'en',
                    'notifications' => true,
                    'main_color' => '#F1504A',
                    'updated_at' => $now,
                    'created_at' => DB::raw('COALESCE(created_at, NOW())'),
                ]
            );
        }

        $employeeId = DB::table('users')->where('email', 'employee@system.com')->value('id');
        if ($employeeId) {
            DB::table('settings')->updateOrInsert(
                ['user_id' => $employeeId],
                [
                    'theme' => 'light',
                    'language' => 'en',
                    'notifications' => true,
                    'main_color' => '#f75eb7ff',
                    'updated_at' => $now,
                    'created_at' => DB::raw('COALESCE(created_at, NOW())'),
                ]
            );
        }

        // Academic years
        DB::table('academic_years')->updateOrInsert(
            ['start_year' => 2025, 'end_year' => 2026],
            ['updated_at' => $now, 'created_at' => DB::raw('COALESCE(created_at, NOW())')]
        );

        // Departments
        DB::table('departments')->updateOrInsert(
            ['name' => 'Computer Science'],
            ['updated_at' => $now, 'created_at' => DB::raw('COALESCE(created_at, NOW())')]
        );

        // Rooms generation
        $rooms = [];
        $prefixes = ['L', 'B', 'S'];
        // First set: prefix + 3-digit number (001..010)
        foreach ($prefixes as $p) {
            for ($i = 1; $i <= 10; $i++) {
                $name = $p . str_pad($i, 3, '0', STR_PAD_LEFT);
                $rooms[] = ['name' => $name, 'capacity' => 30, 'disabled' => false, 'created_at' => $now, 'updated_at' => $now];
            }
        }
        // Second set: prefix + '1' + 2-digit (100..109)
        foreach ($prefixes as $p) {
            for ($i = 1; $i <= 10; $i++) {
                $name = $p . '1' . str_pad($i, 2, '0', STR_PAD_LEFT);
                $rooms[] = ['name' => $name, 'capacity' => 30, 'disabled' => false, 'created_at' => $now, 'updated_at' => $now];
            }
        }
        // Third set: prefix + '2' + 2-digit
        foreach ($prefixes as $p) {
            for ($i = 1; $i <= 10; $i++) {
                $name = $p . '2' . str_pad($i, 2, '0', STR_PAD_LEFT);
                $rooms[] = ['name' => $name, 'capacity' => 30, 'disabled' => false, 'created_at' => $now, 'updated_at' => $now];
            }
        }

        // Insert rooms if not exist
        DB::table('rooms')->insertOrIgnore($rooms);

        // Specialities
        $specialities = [
            ['Software Engineering','SE'],
            ['Networks & Telecommunications','NT'],
            ['Artificial Intelligence','AI'],
            ['Cyber Security','CS'],
            ['Information Systems','IS'],
            ['Data Science','DS'],
            ['Embedded Systems','ES'],
            ['Web Technologies','WEB'],
            ['Cloud Computing','CLOUD'],
            ['Mobile Development','MOB'],
            ['Computer Vision','CV'],
            ['Game Development','GAME'],
            ['Robotics','ROB'],
            ['Database Administration','DBA'],
            ['DevOps Engineering','DEVOPS'],
            ['IOT Engineering','IOT'],
            ['High Performance Computing','HPC'],
            ['Human–Computer Interaction','HCI'],
            ['Computer Science General','CSG'],
            ['Virtual Reality','VR'],
        ];

        $specialityRows = [];
        foreach ($specialities as $s) {
            $specialityRows[] = [
                'name' => $s[0],
                'short_name' => $s[1],
                'department_id' => 1,
                'description' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // Insert specialities, avoid duplicates based on short_name
        foreach ($specialityRows as $sp) {
            DB::table('specialities')->updateOrInsert(
                ['short_name' => $sp['short_name']],
                [
                    'name' => $sp['name'],
                    'department_id' => $sp['department_id'],
                    'description' => $sp['description'],
                    'updated_at' => $now,
                    'created_at' => DB::raw('COALESCE(created_at, NOW())'),
                ]
            );
        }

        // General settings
        DB::table('general_settings')->updateOrInsert(
            ['academic_year_id' => 1, 'department_id' => 1],
            ['semester' => 'Semester 1', 'updated_at' => $now, 'created_at' => DB::raw('COALESCE(created_at, NOW())')]
        );
    }
}
