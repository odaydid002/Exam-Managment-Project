import React from 'react'
import Text from '../../components/text/Text'

const AdminReports = () => {
  document.title = 'Unitime - Reports'
  return (
    <div className='full pd'>
      <Text css='h4p' text='Reports' size='var(--text-l)' />
      <div style={{ marginTop: '1em' }}>
        <Text text='Reports management will be implemented here.' color='var(--text-low)' />
      </div>
    </div>
  )
}

export default AdminReports
