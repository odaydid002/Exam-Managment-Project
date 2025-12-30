import React from 'react'
import Text from '../../components/text/Text'

const AdminExamRequests = () => {
  document.title = 'Unitime - Exam Requests'
  return (
    <div className='full pd'>
      <Text css='h4p' text='Exam Requests' size='var(--text-l)' />
      <div style={{ marginTop: '1em' }}>
        <Text text='Exam requests list and management will be implemented here.' color='var(--text-low)' />
      </div>
    </div>
  )
}

export default AdminExamRequests
