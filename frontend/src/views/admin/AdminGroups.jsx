import React from 'react'

import styles from './admin.module.css'

import Text from '../../components/text/Text';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import Float from '../../components/containers/Float';
import FloatButton from '../../components/buttons/FloatButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';

const AdminGroups = () => {
  document.title = "Unitime - Groups";
  return (
    <div className={`${styles.modulesLayout} full scrollbar`}>
      <Float bottom='6em' right="1em" css='h4pc flex column gap'>
        <FloatButton icon="fa-solid fa-file-arrow-up" color='var(--border-low)' onClick={()=>{}}/>
        <FloatButton icon="fa-solid fa-wand-sparkles" color='var(--border-low)' onClick={()=>{}}/>
        <FloatButton icon="fa-solid fa-plus" onClick={()=>{}}/>
      </Float>
      <div className={`${styles.modulesHeader}`}>
        <div className={`${styles.modulesPath} flex a-center h4p`}>
            <Text css='h4p' align='left' text='Main /' color='var(--text-low)' size='var(--text-m)' />
            <Text css='h4p' align='left' mrg='0 0.25em' text='Groups' color='var(--text)' size='var(--text-m)' />
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
          <Text align='left' text='Groups List' size='var(--text-l)' />
          <div className="flex row a-center gap mrla">
            <PrimaryButton text='Add Group' icon='fa-solid fa-plus' onClick={()=>{}} css='h4p'/>
            <SecondaryButton text='Import Excel' onClick={()=>{}} css='h4p'/>
            <SecondaryButton text='Export' onClick={()=>{}} css='h4p'/>
          </div>
        </div>
        <div className={`${styles.modulesTable} full ${styles.dashBGC} shimmer`}></div>
      </div>
    </div>
  )
}

export default AdminGroups