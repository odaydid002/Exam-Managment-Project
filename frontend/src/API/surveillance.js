import api from './app'

const getByExam = async (examId) => {
  const res = await api.get(`/surveillance/exam/${examId}`)
  // Handle both array response and object response
  if (Array.isArray(res.data)) {
    return res.data
  }
  return res.data.surveillance || res.data || []
}

const assign = async (examId, teacherNumber) => {
  const res = await api.post(`/surveillance/assign`, {
    exam_id: examId,
    teacher_number: teacherNumber
  })
  return res.data
}

const unassign = async (examId, teacherNumber) => {
  const res = await api.delete(`/surveillance/${examId}/${teacherNumber}`)
  return res.data
}

const getByTeacher = async (teacherId) => {
  const res = await api.get(`/surveillance/teacher/${teacherId}`)
  // Handle both array response and object response
  if (Array.isArray(res.data)) {
    return res.data
  }
  return res.data.surveillances || res.data.surveillance || res.data || []
}

const getTeacherExams = async (teacherId, params) => {
  const res = await api.get(`/surveillance/exams/teacher/${teacherId}`, { params })
  // Handle both array response and object response
  if (Array.isArray(res.data)) {
    return res.data
  }
  return res.data.exams || res.data || []
}

const approve = async (surveillanceId) => {
  const res = await api.post(`/surveillance/approve`, {
    surveillance_id: surveillanceId
  })
  return res.data
}

const reject = async (surveillanceId) => {
  const res = await api.post(`/surveillance/reject`, {
    surveillance_id: surveillanceId
  })
  return res.data
}

export { getByExam, assign, unassign, getByTeacher, getTeacherExams, approve, reject }
