import React from 'react'

import styles from './admin.module.css'

import Text from '../../components/text/Text';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import Float from '../../components/containers/Float';
import FloatButton from '../../components/buttons/FloatButton';

const AdminModules = () => {
  document.title = "Unitime - Modules";
  return (
    <div className={`${styles.modulesLayout} full scrollbar`}>
      <Float bottom='6em' right="1em" css='h4pc'>
        <FloatButton icon="fa-solid fa-plus" onClick={()=>{}}/>
      </Float>
      <div className={`${styles.modulesHeader}`}>
        <div className={`${styles.modulesPath} flex a-center h4p`}>
            <Text css='h4p' align='left' text='Main /' color='var(--text-low)' size='var(--text-m)' />
            <Text css='h4p' align='left' mrg='0 0.25em' text='Modules' color='var(--text)' size='var(--text-m)' />
        </div>
      </div>
      <div className={`${styles.modulesStatics} flex row gap wrap j-center`}>
        <div className={`${styles.modulesStatic} ${styles.dashBGC} grow-1 shimmer`}></div>
        <div className={`${styles.modulesStatic} ${styles.dashBGC} grow-1 shimmer`}></div>
        <div className={`${styles.modulesStatic} ${styles.dashBGC} grow-1 shimmer`}></div>
        <div className={`${styles.modulesStatic} ${styles.dashBGC} grow-1 shimmer`}></div>
      </div>
      <div className={`${styles.modulesContent} flex column`}>
        <div className="flex row a-center">
          <Text align='left' text='Modules List' size='var(--text-l)' />
          <PrimaryButton text='Add Module' icon='fa-solid fa-plus' onClick={()=>{}} mrg='0 0 0 auto' css='h4p'/>
        </div>
        <div className={`${styles.modulesTable} full ${styles.dashBGC} shimmer`}></div>
      </div>
    </div>
  )
}

export default AdminModules