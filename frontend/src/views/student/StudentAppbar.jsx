import React from 'react'
import Appbar from '../../components/navigators/Appbar'
import AppbarElement from '../../components/navigators/AppbarElement'

const StudentAppbar = () => {
  return (
    <Appbar>
        <AppbarElement type="link" path="home/" title="Home" icon="fa-solid fa-house"/>
        <AppbarElement type="button" path="search/" title="Search" icon="fa-solid fa-magnifying-glass"/>
        <AppbarElement type="link" path="schedule/" title="Schedule" icon="fa-solid fa-calendar"/>
        <AppbarElement type="link" path="profile/" title="Profile" icon="fa-solid fa-user"/>
    </Appbar>
  )
}

export default StudentAppbar