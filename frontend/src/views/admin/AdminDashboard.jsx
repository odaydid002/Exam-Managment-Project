import React from 'react'

import styles from "./admin.module.css"
import Text from '../../components/text/Text'

const AdminDashboard = () => {
  const timeNow = new Date().getHours();
  const greet = timeNow > 5 && timeNow < 12?"Good Morning":timeNow > 12 && timeNow < 17?"Good Afternoon":"Good Evening";

  

  return (
    <div className={`${styles.dashboardLayout} full scrollbar`}>
      <div className={`${styles.dashboardHeader}`}>
        <div className={`${styles.dashHead}`}>
          <Text css='h4p' align='left' text='Home/' color='var(--text-low)' size='var(--text-m)' />
          <div className="flex row a-center">
            <Text align='left' text={greet} color='var(--text)' size='var(--text-xl)' />
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M15.8201 2.55005C15.8201 2.55005 17.2726 2.77005 18.6176 4.21005C19.9626 5.65255 20.5851 7.50505 20.5851 7.50505" stroke="#444444" stroke-miterlimit="10" stroke-linecap="round"/>
              <path d="M19.3601 0.875C19.3601 0.875 20.5776 1.4875 21.5176 3C22.4576 4.5125 22.6851 6.2625 22.6851 6.2625" stroke="#444444" stroke-miterlimit="10" stroke-linecap="round"/>
              <path d="M8.92746 27.6825C8.92746 27.6825 7.46246 27.78 5.83996 26.66C4.21746 25.54 3.20996 23.865 3.20996 23.865" stroke="#444444" stroke-miterlimit="10" stroke-linecap="round"/>
              <path d="M7.88254 30.1399C7.88254 30.1399 6.52254 30.1974 4.96254 29.3349C3.40254 28.4724 2.35254 27.0549 2.35254 27.0549" stroke="#444444" stroke-miterlimit="10" stroke-linecap="round"/>
              <path d="M12.3987 19.6734C12.2179 19.8427 12.0355 19.6405 12.0355 19.6405C12.0355 19.6405 8.99843 16.4227 8.80122 16.2781C8.52348 16.076 7.92857 15.7588 7.33365 16.3718C7.08549 16.6265 6.68121 17.1935 7.43226 18.1072C7.59495 18.3044 12.3264 23.2906 12.6024 23.5601C12.6024 23.5601 14.7882 25.6867 16.1111 26.487C16.4776 26.7089 16.8901 26.9439 17.3716 27.1082C17.8515 27.2726 18.3939 27.386 18.9658 27.386C19.5377 27.3925 20.1309 27.2824 20.6913 27.077C21.2518 26.8699 21.7744 26.5692 22.2493 26.2224C22.366 26.1337 22.4843 26.0449 22.5944 25.9496L22.9132 25.6867C23.1351 25.501 23.3422 25.3054 23.541 25.1065C23.9404 24.7088 24.3003 24.2832 24.6175 23.8477C24.933 23.4105 25.2009 22.9586 25.4145 22.5083C25.6282 22.058 25.7777 21.6061 25.8681 21.1788C25.9634 20.7531 25.9897 20.3505 25.9749 19.9988C25.9717 19.6471 25.901 19.3464 25.8435 19.1064C25.7777 18.8665 25.7071 18.6873 25.6512 18.569C25.597 18.4507 25.5674 18.3882 25.5674 18.3882C25.4918 18.1762 25.4195 17.9741 25.3554 17.7917C25.1746 17.2773 24.9659 16.7004 24.7489 16.1072C24.6569 15.8557 24.6142 15.7423 24.6142 15.7423L24.6158 15.7473C23.8188 13.5829 22.9626 11.3528 22.9626 11.3528C22.8327 10.96 22.3545 10.8236 22.0028 11.0767C20.9872 11.8064 20.6766 12.8713 21.0348 14.0069L21.9535 16.5246C22.0833 16.8056 21.7251 17.131 21.4851 16.9355C20.7308 16.3208 19.135 14.6265 19.135 14.6265C18.4218 13.9428 14.3971 9.81617 14.1275 9.56473C13.5852 9.0602 12.9015 8.80054 12.3806 9.18346C11.8481 9.57459 11.7002 10.1794 12.2146 10.84C12.3543 11.0192 16.4218 15.3167 16.4218 15.3167C16.6584 15.5648 16.379 15.9165 16.1177 15.675C16.1177 15.675 11.0576 10.3963 10.8292 10.1498C10.3115 9.58774 9.47995 9.46448 8.98693 9.92792C8.50541 10.3799 8.51691 11.121 9.04281 11.7028C9.21043 11.8869 12.775 15.6503 14.2015 17.1918C14.2968 17.2954 14.3708 17.4334 14.2294 17.5632C14.2278 17.5649 14.0848 17.7194 13.9007 17.5222C13.5129 17.108 9.63937 13.0718 9.42408 12.8532C8.92941 12.3503 8.26547 12.112 7.73136 12.6018C7.24491 13.0471 7.16602 13.8245 7.72478 14.3734L12.4167 19.3332C12.4167 19.3332 12.5696 19.514 12.3987 19.6734Z" fill="#FAC036"/>
              <path d="M20.0158 15.5386L20.4119 15.9626C20.4119 15.9626 18.1456 18.15 19.6904 21.5091C19.6904 21.5091 19.8909 21.9348 19.628 22.0054C19.628 22.0054 19.3979 22.1336 19.135 21.4795C19.135 21.4779 17.5754 18.288 20.0158 15.5386Z" fill="#E48C15"/>
            </svg>
          </div>
        </div>
        <div className={`${styles.dashStatics} flex row gap wrap j-center`}>
          <div className={`${styles.dashStatic} ${styles.dashBGC} grow-1 shimmer`}>
          </div>
          <div className={`${styles.dashStatic} ${styles.dashBGC} grow-1 shimmer`}>
          </div>
          <div className={`${styles.dashStatic} ${styles.dashBGC} grow-1 shimmer`}>
          </div>
          <div className={`${styles.dashStatic} ${styles.dashBGC} grow-1 shimmer`}>
          </div>
        </div>
      </div>
      <div className={`${styles.dashboardContent} flex row wrap gap`}>
          <div className={`${styles.dashContent} grow-3`}>
            <div className={`${styles.dashRooms} ${styles.dashBGC} shimmer`}>
            </div>
            <div className={`${styles.dashReports} ${styles.dashBGC} shimmer`}>
            </div>
          </div>
          <div className={`${styles.dashContentSide} ${styles.dashBGC} grow-1 shimmer`}>
          </div>
      </div>
    </div>
  )
}

export default AdminDashboard