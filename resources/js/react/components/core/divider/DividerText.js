import clsx from 'clsx';
import React from 'react';

const DividerText = ({ text, className }) => {
  return (
    <div className={clsx('divider', className)}>
      <div className={clsx('divider-text')}>{text}</div>
    </div>
  )
}
export default DividerText
