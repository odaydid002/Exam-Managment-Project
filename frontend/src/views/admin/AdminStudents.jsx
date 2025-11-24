import React from 'react'

import styles from './admin.module.css'

import Text from '../../components/text/Text';
import Float from '../../components/containers/Float';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import FloatButton from '../../components/buttons/FloatButton';

const AdminStudents = () => {

  document.title = "Unitime - Students";

  return (
    <div className={`${styles.teachersLayout} full scrollbar`}>
      <div className={`${styles.teachersHeader} h4p`}>
        <div className={`${styles.teachersPath} flex`}>
          <Text css='h4p' align='left' text='Main /' color='var(--text-low)' size='var(--text-m)' />
          <Text css='h4p' align='left' mrg='0 0.25em' text='Students' color='var(--text)' size='var(--text-m)' />
        </div>
      </div>
      <div className={`${styles.teachersContent}`}>
        <div className={`${styles.teachersHead} flex row a-center j-spacebet`}>
            <Text align='left' text='Students List' w='600' color='var(--text)' size='var(--text-l)' />
            <div className="flex row h100 a-center gap h4p">
              <SecondaryButton text="Import List" icon="fa-regular fa-file-excel" onClick={()=>{}}/>
              <PrimaryButton text='Add Student' icon='fa-solid fa-plus' onClick={()=>{}}/>
            </div>
              <Float css='flex column a-center gap h4pc' bottom="6em" right="1em">
                <FloatButton icon="fa-solid fa-file-arrow-up" onClick={()=>{}}/>
                <FloatButton icon='fa-solid fa-plus' onClick={()=>{}}/>
              </Float>
        </div>
        <div className={`${styles.teachersTable} ${styles.dashBGC} shimmer`}>
        </div>
      </div>
    </div>
  )
}

export default AdminStudents