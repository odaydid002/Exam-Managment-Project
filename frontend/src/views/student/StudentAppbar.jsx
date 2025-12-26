import React from 'react'
import Appbar from '../../components/navigators/Appbar'
import AppbarElement from '../../components/navigators/AppbarElement'

const StudentAppbar = () => {
  return (
    <Appbar>
        <AppbarElement type="link" path="home/" title="Home" icon="fa-solid fa-house"/>
        <AppbarElement type="link" path="schedule/" title="Schedule" icon="fa-solid fa-calendar"/>
        <AppbarElement type="button" path="settings/" title="Settings" icon="fa-solid fa-gear"/>
    </Appbar>
  )
}

export default StudentAppbar