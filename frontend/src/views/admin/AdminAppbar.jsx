import React from 'react'
import Appbar from '../../components/navigators/Appbar'
import AppbarElement from '../../components/navigators/AppbarElement'

const AdminAppbar = () => {
  return (
    <Appbar>
        <AppbarElement type="link" path="teachers/" title="Teachers" icon="fa-solid fa-user-tie"/>
        <AppbarElement type="link" path="students/" title="Students" icon="fa-solid fa-user-graduate"/>
        <AppbarElement type="link" path="modules/" title="Modules" icon="fa-solid fa-book"/>
        <AppbarElement type="link" path="home/" title="Home" icon="fa-solid fa-house"/>
        <AppbarElement type="link" path="planning/" title="Planning" icon="fa-solid fa-calendar-days"/>
        <AppbarElement type="link" path="groups/" title="Groups" icon="fa-solid fa-users-line"/>
        <AppbarElement type="link" path="settings/" title="Settings" icon="fa-solid fa-gear"/>
    </Appbar>
  )
}

export default AdminAppbar