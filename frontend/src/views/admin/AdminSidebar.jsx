import React from 'react'

import Logo from '../../components/images/Logo'
import Profile from '../../components/containers/profile'
import ExpendContainer from '../../components/containers/ExpendContainer'
import SearchInput from '../../components/input/SearchInput'
import NavElement from '../../components/navigators/NavElement'
import NavElementButton from '../../components/navigators/NavElementButton'
import NavSeparator from '../../components/navigators/NavSeparator'

const AdminSidebar = () => {
  return (
    <ExpendContainer w="var(--sidebar-width)" xw="var(--sidebar-expand)" h="calc(100vh - 2em)"  minHeight="600px" classes="pdv flex column bgc rounded-l ease-in-out mrg h4p">
        <Logo w={35} h={35} mrg="0 0 1em 0"/>
        <NavElement path="home/" title="Home" icon="fa-solid fa-house" mrt="0" hover/>
        <NavSeparator title="Main"/>
        <NavElement path="teachers/" title="Teachers" icon="fa-solid fa-user-tie" mrt="0" hover/>
        <NavElement path="students/" title="Students" icon="fa-solid fa-user-graduate" mrt="0" hover/>
        <NavElement path="modules/" title="Modules" icon="fa-solid fa-book" mrt="0" hover/>
        <NavElement path="groups/" title="Groups" icon="fa-solid fa-users-line" mrt="0" hover/>
        <NavElement path="planning/" title="Planning" icon="fa-solid fa-calendar-days" mrt="0" hover/>
        <NavSeparator title="System"/>
        <NavElementButton onClick={()=>{}} title="" icon="fa-solid fa-bell" mrt="0" hover/>
        <NavElement path="settings/" title="" icon="fa-solid fa-gear" mrt="0" hover/>
        <NavElementButton onClick={()=>{}} title="" icon="fa-solid fa-arrow-right-from-bracket" mrt="0" hover/>
        <NavElement path="profile/" mrt="0">
          <Profile width="35px" nav={true} classes="clickable"/>
        </NavElement>
    </ExpendContainer>
  )
}

export default AdminSidebar