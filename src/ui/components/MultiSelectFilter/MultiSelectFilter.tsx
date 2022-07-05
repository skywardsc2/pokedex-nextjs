import {
  FormControl,
  FormControlProps,
  InputLabel,
  InputLabelProps,
  OutlinedInput,
  Select,
  SelectProps
} from '@mui/material'
import React, { ReactNode } from 'react'

type MultiSelectFilterProps<T> = FormControlProps & {
  inputLabelProps?: InputLabelProps
  selectProps?: SelectProps<T>
  children?: React.ReactNode
  label?: ReactNode
}

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8

type MultiSelectFilterType = <T>({
  children,
  selectProps,
  inputLabelProps,
  label
}: MultiSelectFilterProps<T>) => JSX.Element

export const MultiSelectFilter: MultiSelectFilterType = ({
  children,
  selectProps,
  inputLabelProps,
  label,
  ...restProps
}) => {
  return (
    <FormControl sx={{ width: 300, m: 1 }} {...restProps}>
      <InputLabel id='type-multiple-checkbox-label' {...inputLabelProps}>
        {label}
      </InputLabel>
      <Select
        multiple
        variant='outlined'
        labelId='type-multiple-checkbox-label'
        id='type-multiple-checkbox'
        input={<OutlinedInput label={label} />}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
              width: 250
            }
          }
        }}
        {...selectProps}
      >
        {children}
      </Select>
    </FormControl>
  )
}

export default MultiSelectFilterType
