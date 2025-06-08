import { ActionIcon, Group, InputWrapperProps, Select } from '@mantine/core';
import { IconPencil, IconPlus } from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';

interface SearchSelectInputValue {
  id: any;
  label: string;
  data: any;
}

interface SearchSelectInputProps extends Omit<InputWrapperProps, 'value' | 'onChange'> {
  value?: SearchSelectInputValue;
  onChange?: (value?: SearchSelectInputValue | undefined) => void;
  placeholder?: string;
  onSearch: (q: string) => Promise<SearchSelectInputValue[]>;
  onCreate?: () => void;
  onEdit?: (value: SearchSelectInputValue) => void;
}

export const SearchSelectInput: FC<SearchSelectInputProps> = (props) => {
  const [searchValue, setSearchValue] = useState('');
  const [options, setOptions] = useState<SearchSelectInputValue[]>(props.value ? [props.value] : []);

  let _props = { ...props } as any;

  delete _props.value;
  delete _props.onChange;
  delete _props.onSearch;
  delete _props.onCreate;
  delete _props.onEdit;

  useEffect(() => {
    props.onSearch('')
      .then(setOptions)
      .catch(() => []);
  }, [])

  useEffect(() => {
    onSearch(searchValue);
  }, [searchValue])

  const onSearch = async (_q = '') => {
    let q = _q.trim();
    if (_q === props.value?.label) q = '';
    const data = await props.onSearch(q).catch(() => ([]));
    setOptions(data);
  }

  return (
    <Group gap={8}>
      <Select
        flex={1}
        {...(_props as any)}
        searchable
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        data={options.map((o) => ({ value: o.id, label: o.label }))}
        value={props.value?.id}
        onChange={(value) => {
          const option = options.find((o) => o.id === value);
          props.onChange?.(option);
        }}
        clearable
      />

      {(props.onEdit && !!props.value) && <ActionIcon
        variant='outline'
        size={36}
        color="gray.4"
        onClick={() => props.onEdit?.(props.value!)}
        mt={props.label ? 23 : 0}
      >
        <IconPencil size={18} />
      </ActionIcon>}

      {props.onCreate && <ActionIcon
        variant='outline'
        size={36}
        color="gray.4"
        onClick={props.onCreate}
        mt={props.label ? 23 : 0}
      >
        <IconPlus size={18} />
      </ActionIcon>}
    </Group>
  )
}