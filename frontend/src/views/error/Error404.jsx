import React from 'react'
import { useNavigate } from "react-router-dom";

import FullViewPage from '../../components/containers/FullViewPage'
import Logo from '../../components/images/Logo'
import Text from '../../components/text/Text'
import PrimaryButton from '../../components/buttons/PrimaryButton'

const Error404 = () => {
  const navigate = useNavigate();
  return (
    <FullViewPage>
      <div style={{marginTop: "auto"}} className='h4pc'></div>
      <Logo w='50' wc='fit-content' forceLight/>
      <Text text='404' size='100px' wh="bold" css='poppins curs-default' color='white' />
      <Text text='Page Not Found' size='30px' wh="bold" css='poppins curs-default' color='white'/>
      <br />
      <Text text="Oops! The page you're looking for doesn't exist." size='14px' wh="bold" css='poppins curs-default' color='white' />
      <Text text="It might have been moved or deleted." size='14px' wh="bold" css='poppins curs-default' color='white' />
      <PrimaryButton icon='fa-solid fa-arrow-left' text='Go Back Home' css='btm' mrg='2em 0 0 0' onClick={() => navigate("/")}/>
    </FullViewPage>
  )
}

export default Error404