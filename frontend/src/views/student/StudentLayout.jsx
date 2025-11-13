import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import Sidebar from '../../components/navigators/sidebar'

const StudentLayout = () => {
  return (
    <>
        <Sidebar>
          
        </Sidebar>
        <Outlet />
    </>
  )
}

export default StudentLayout