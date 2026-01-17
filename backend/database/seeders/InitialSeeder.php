<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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
                'password' => Hash::make('admin'),
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
                'password' => Hash::make('123'),
                'phone' => null,
                'role' => 'employee',
                'image' => null,
                'updated_at' => $now,
                'created_at' => DB::raw('COALESCE(created_at, NOW())'),
            ]
        );

        DB::table('users')->updateOrInsert(
            ['email' => 'student@test.com'],
            [
                'fname' => 'Student',
                'lname' => 'test',
                'birth_date' => '1990-01-01',
                'gender' => 'male',
                'password' => Hash::make('123123'),
                'phone' => '0698754810',
                'role' => 'student',
                'image' => 'https://api.dicebear.com/7.x/initials/svg?seed=Student%20Test',
                'updated_at' => $now,
                'created_at' => DB::raw('COALESCE(created_at, NOW())'),
            ]
        );

        DB::table('users')->updateOrInsert(
            ['email' => 'teacher@test.com'],
            [
                'fname' => 'Teacher',
                'lname' => 'Test',
                'birth_date' => '1990-01-01',
                'gender' => 'male',
                'password' => Hash::make('123123'),
                'phone' => '0654125470',
                'role' => 'teacher',
                'image' => 'https://api.dicebear.com/7.x/initials/svg?seed=Teacher%20Test',
                'updated_at' => $now,
                'created_at' => DB::raw('COALESCE(created_at, NOW())'),
            ]
        );

        // Settings seeding removed — settings will be created via DB trigger or application logic

        // Academic years
        DB::table('academic_years')->updateOrInsert(
            ['start_year' => 2025, 'end_year' => 2026],
            ['updated_at' => $now, 'created_at' => DB::raw('COALESCE(created_at, NOW())')]
        );

        // Semesters for the academic year
        DB::table('semesters')->updateOrInsert(
            ['name' => 'Semester 1', 'academic_year_id' => 1],
            ['order' => 1, 'updated_at' => $now, 'created_at' => DB::raw('COALESCE(created_at, NOW())')]
        );
        DB::table('semesters')->updateOrInsert(
            ['name' => 'Semester 2', 'academic_year_id' => 1],
            ['order' => 2, 'updated_at' => $now, 'created_at' => DB::raw('COALESCE(created_at, NOW())')]
        );

        // Departments
        DB::table('departments')->updateOrInsert(
            ['name' => 'Computer Science'],
            ['updated_at' => $now, 'created_at' => DB::raw('COALESCE(created_at, NOW())')]
        );

        // Rooms
        $rooms = [
            ['name' => 'A1', 'type' => 'amphitheater', 'capacity' => 100, 'disabled' => false, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'S202', 'type' => 'classroom', 'capacity' => 30, 'disabled' => false, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'L001', 'type' => 'laboratory', 'capacity' => 25, 'disabled' => false, 'created_at' => $now, 'updated_at' => $now],
        ];

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

        DB::table('students')->updateOrInsert(
            ['user_id' => 3],
            [
                'number' => 123123,
                'group_code' => null,
                'speciality_id' => 1,
                'level' => 'Master 1',
                'updated_at' => $now,
                'created_at' => DB::raw('COALESCE(created_at, NOW())'),
            ]
        );

        DB::table('teachers')->updateOrInsert(
            ['user_id' => 4],
            [
                'number' => 123123,
                'adj' => 'Mr',
                'speciality_id' => 2,
                'position' => 'Doctor',
                'updated_at' => $now,
                'created_at' => DB::raw('COALESCE(created_at, NOW())'),
            ]
        );

        // General settings
        $semesterId = DB::table('semesters')
            ->where('name', 'Semester 1')
            ->where('academic_year_id', 1)
            ->value('id');

        DB::table('general_settings')->updateOrInsert(
            ['academic_year_id' => 1, 'department_id' => 1],
            [
                'semester' => 'Semester 1',
                'semester_id' => $semesterId,
                'updated_at' => $now,
                'created_at' => DB::raw('COALESCE(created_at, NOW())')
            ]
        );

        // Assign seeded users to the default department
        DB::table('users')->where('email', 'admin@system.com')->update(['department_id' => 1, 'updated_at' => $now]);
        DB::table('users')->where('email', 'employee@system.com')->update(['department_id' => 1, 'updated_at' => $now]);
        DB::table('users')->where('id', 3)->update(['department_id' => 1, 'updated_at' => $now]);
        DB::table('users')->where('id', 4)->update(['department_id' => 1, 'updated_at' => $now]);
    }
}
