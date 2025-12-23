<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Mailable;

class MailerController extends Controller
{
    /**
     * Send an email to a single user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendEmail(Request $request)
    {
        $validated = $request->validate([
            'recipient' => 'required|email',
            'subject' => 'required|string',
            'body' => 'required|string',
            'cc' => 'nullable|email',
            'bcc' => 'nullable|email',
        ]);

        try {
            Mail::raw($validated['body'], function ($message) use ($validated) {
                $message->to($validated['recipient'])
                    ->subject($validated['subject']);

                if ($validated['cc'] ?? null) {
                    $message->cc($validated['cc']);
                }
                if ($validated['bcc'] ?? null) {
                    $message->bcc($validated['bcc']);
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Email sent successfully to ' . $validated['recipient'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send email: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send emails to multiple recipients (bulk)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendBulk(Request $request)
    {
        $validated = $request->validate([
            'recipients' => 'required|array|min:1',
            'recipients.*' => 'email',
            'subject' => 'required|string',
            'body' => 'required|string',
            'cc' => 'nullable|email',
            'bcc' => 'nullable|email',
        ]);

        try {
            $successCount = 0;
            $failedCount = 0;
            $failedRecipients = [];

            foreach ($validated['recipients'] as $recipient) {
                try {
                    Mail::raw($validated['body'], function ($message) use ($validated, $recipient) {
                        $message->to($recipient)
                            ->subject($validated['subject']);

                        if ($validated['cc'] ?? null) {
                            $message->cc($validated['cc']);
                        }
                        if ($validated['bcc'] ?? null) {
                            $message->bcc($validated['bcc']);
                        }
                    });
                    $successCount++;
                } catch (\Exception $e) {
                    $failedCount++;
                    $failedRecipients[] = [
                        'email' => $recipient,
                        'error' => $e->getMessage(),
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Bulk email sent',
                'summary' => [
                    'total' => count($validated['recipients']),
                    'success' => $successCount,
                    'failed' => $failedCount,
                ],
                'failed_recipients' => $failedRecipients,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send bulk emails: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send email to specific students
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendToStudents(Request $request)
    {
        $validated = $request->validate([
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:students,id',
            'speciality_id' => 'nullable|exists:specialities,id',
            'group_code' => 'nullable|exists:groupes,code',
            'section_id' => 'nullable|exists:sections,id',
            'subject' => 'required|string',
            'body' => 'required|string',
            'cc' => 'nullable|email',
            'bcc' => 'nullable|email',
        ]);

        try {
            $query = Student::query();

            // Filter by specific student IDs
            if ($validated['student_ids'] ?? null) {
                $query->whereIn('id', $validated['student_ids']);
            }

            // Filter by speciality
            if ($validated['speciality_id'] ?? null) {
                $query->where('speciality_id', $validated['speciality_id']);
            }

            // Filter by group
            if ($validated['group_code'] ?? null) {
                $query->where('group_code', $validated['group_code']);
            }

            // Filter by section
            if ($validated['section_id'] ?? null) {
                $query->where('section_id', $validated['section_id']);
            }

            $students = $query->get();

            if ($students->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No students found matching the criteria',
                ], 404);
            }

            $successCount = 0;
            $failedCount = 0;
            $failedRecipients = [];

            foreach ($students as $student) {
                // Get email from user relationship
                $user = User::find($student->user_id);
                if (!$user || !$user->email) {
                    $failedCount++;
                    $failedRecipients[] = [
                        'student_id' => $student->id,
                        'error' => 'No email found for this student',
                    ];
                    continue;
                }

                try {
                    Mail::raw($validated['body'], function ($message) use ($validated, $user) {
                        $message->to($user->email)
                            ->subject($validated['subject']);

                        if ($validated['cc'] ?? null) {
                            $message->cc($validated['cc']);
                        }
                        if ($validated['bcc'] ?? null) {
                            $message->bcc($validated['bcc']);
                        }
                    });
                    $successCount++;
                } catch (\Exception $e) {
                    $failedCount++;
                    $failedRecipients[] = [
                        'student_id' => $student->id,
                        'email' => $user->email,
                        'error' => $e->getMessage(),
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Emails sent to students',
                'summary' => [
                    'total' => count($students),
                    'success' => $successCount,
                    'failed' => $failedCount,
                ],
                'failed_recipients' => $failedRecipients,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send emails to students: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send email to specific teachers
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendToTeachers(Request $request)
    {
        $validated = $request->validate([
            'teacher_numbers' => 'nullable|array',
            'teacher_numbers.*' => 'exists:teachers,number',
            'speciality_id' => 'nullable|exists:specialities,id',
            'department_id' => 'nullable|exists:departments,id',
            'subject' => 'required|string',
            'body' => 'required|string',
            'cc' => 'nullable|email',
            'bcc' => 'nullable|email',
        ]);

        try {
            $query = Teacher::query();

            // Filter by specific teacher numbers
            if ($validated['teacher_numbers'] ?? null) {
                $query->whereIn('number', $validated['teacher_numbers']);
            }

            // Filter by speciality
            if ($validated['speciality_id'] ?? null) {
                $query->where('speciality_id', $validated['speciality_id']);
            }

            // Filter by department
            if ($validated['department_id'] ?? null) {
                $query->where('department_id', $validated['department_id']);
            }

            $teachers = $query->get();

            if ($teachers->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No teachers found matching the criteria',
                ], 404);
            }

            $successCount = 0;
            $failedCount = 0;
            $failedRecipients = [];

            foreach ($teachers as $teacher) {
                // Get email from user relationship
                $user = User::find($teacher->user_id);
                if (!$user || !$user->email) {
                    $failedCount++;
                    $failedRecipients[] = [
                        'teacher_number' => $teacher->number,
                        'error' => 'No email found for this teacher',
                    ];
                    continue;
                }

                try {
                    Mail::raw($validated['body'], function ($message) use ($validated, $user) {
                        $message->to($user->email)
                            ->subject($validated['subject']);

                        if ($validated['cc'] ?? null) {
                            $message->cc($validated['cc']);
                        }
                        if ($validated['bcc'] ?? null) {
                            $message->bcc($validated['bcc']);
                        }
                    });
                    $successCount++;
                } catch (\Exception $e) {
                    $failedCount++;
                    $failedRecipients[] = [
                        'teacher_number' => $teacher->number,
                        'email' => $user->email,
                        'error' => $e->getMessage(),
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Emails sent to teachers',
                'summary' => [
                    'total' => count($teachers),
                    'success' => $successCount,
                    'failed' => $failedCount,
                ],
                'failed_recipients' => $failedRecipients,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send emails to teachers: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send email to employees (users without student/teacher role, or specific role)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendToEmployees(Request $request)
    {
        $validated = $request->validate([
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'exists:users,id',
            'role' => 'nullable|string',
            'subject' => 'required|string',
            'body' => 'required|string',
            'cc' => 'nullable|email',
            'bcc' => 'nullable|email',
        ]);

        try {
            $query = User::query()
                ->whereDoesntHave('students') // Not a student
                ->whereDoesntHave('teachers'); // Not a teacher

            // Filter by specific user IDs
            if ($validated['user_ids'] ?? null) {
                $query->whereIn('id', $validated['user_ids']);
            }

            // Filter by role if provided
            if ($validated['role'] ?? null) {
                $query->where('role', $validated['role']);
            }

            $employees = $query->get();

            if ($employees->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No employees found matching the criteria',
                ], 404);
            }

            $successCount = 0;
            $failedCount = 0;
            $failedRecipients = [];

            foreach ($employees as $employee) {
                if (!$employee->email) {
                    $failedCount++;
                    $failedRecipients[] = [
                        'user_id' => $employee->id,
                        'error' => 'No email found for this employee',
                    ];
                    continue;
                }

                try {
                    Mail::raw($validated['body'], function ($message) use ($validated, $employee) {
                        $message->to($employee->email)
                            ->subject($validated['subject']);

                        if ($validated['cc'] ?? null) {
                            $message->cc($validated['cc']);
                        }
                        if ($validated['bcc'] ?? null) {
                            $message->bcc($validated['bcc']);
                        }
                    });
                    $successCount++;
                } catch (\Exception $e) {
                    $failedCount++;
                    $failedRecipients[] = [
                        'user_id' => $employee->id,
                        'email' => $employee->email,
                        'error' => $e->getMessage(),
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Emails sent to employees',
                'summary' => [
                    'total' => count($employees),
                    'success' => $successCount,
                    'failed' => $failedCount,
                ],
                'failed_recipients' => $failedRecipients,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send emails to employees: ' . $e->getMessage(),
            ], 500);
        }
    }
}
