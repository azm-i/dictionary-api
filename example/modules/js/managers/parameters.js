import datGui from '~/utils/datGui'

const parameters = {
  folders: [
    {
      name: 'ページ遷移',
      folders: [
        {
          name: 'duration',
          parameters: [
            {
              name: 'in',
              key: 'durationPageIn',
              value: 0.8,
            },
            {
              name: 'out',
              key: 'durationPageOut',
              value: 0.4,
            },
          ],
        },
      ],
      parameters: [
        {
          key: 'easePage',
          value: 'power2.out',
        },
      ],
    },
  ],
}

export default datGui.convertDataset(parameters)
