import Logo from '../../components/images/Logo'
import Profile from '../../components/containers/profile'
import ExpendContainer from '../../components/containers/ExpendContainer'
import NavElement from '../../components/navigators/NavElement'
import NavElementButton from '../../components/navigators/NavElementButton'
import NavSeparator from '../../components/navigators/NavSeparator'
import { logout } from '../../API/auth'
import { useNavigate } from 'react-router-dom'


const TeacherSidebar = () => {
  const navigate = useNavigate()
  return (
    <ExpendContainer w="var(--sidebar-width)" xw="var(--sidebar-expand)" h="calc(100vh - 2em)"  minHeight="600px" classes="pdv flex column bgc rounded-l ease-in-out mrg h4p">
      <Logo w={35} h={35}/>
      <NavElement path="home" title="Home" icon="fa-solid fa-house" mrt="1em" hover/>
      <NavSeparator title="Main"/>
      <NavElement path="schedule" title="Schedule" icon="fa-solid fa-calendar" mrt="0" hover/>
      <NavElement path="modules" title="Modules" icon="fa-solid fa-book" mrt="0" hover/>
      <NavSeparator title="System"/>
      <NavElement path="settings" title="" icon="fa-solid fa-gear" mrt="0" hover/>
      <NavElementButton onClick={()=>{logout(); navigate('/login')}} title="" icon="fa-solid fa-arrow-right-from-bracket" mrt="0" hover/>
    </ExpendContainer>
  )
}

export default TeacherSidebar