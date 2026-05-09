import {
  PluginEInvoiceTemplates,
  PluginEInvoiceTemplateType,
} from './plugin-e-invoices.types';

export const matbaoTemplates: PluginEInvoiceTemplates = {
  [PluginEInvoiceTemplateType.LOAN_INCOME_RECEIPT]: {
    fields: [
      {
        id: 'b5e460ee-e434-497f-97d3-8797e751cdc7',
        type: 'input',
        fieldName: 'NMua_Ten',
        value: '@customerName',
      },
      {
        id: 'e725fab8-b806-476f-8271-bc04355f05d5',
        type: 'input',
        fieldName: 'NMua_DChi',
        value: '@customerAddress',
      },
      {
        id: '48dfa85b-2571-4aaf-8261-953ee0a853e8',
        type: 'input',
        fieldName: 'NMua_SDThoai',
        value: '@customerPhone',
      },
      {
        id: '7f80323e-2708-426b-a507-bcf7bd641336',
        type: 'input',
        fieldName: 'NMua_DCTDTu',
        value: '@customerEmail',
      },
      {
        id: 'c264cf5b-ce1d-46d6-af9c-5fefcb7c3588',
        type: 'input',
        fieldName: 'NMua_CCCDan',
        value: '@customerNationalIdNumber',
      },
      {
        id: 'a891da90-7862-474b-b33b-0a16dfdab9f6',
        type: 'input',
        fieldName: 'KHHDon',
        value: 'C25TAT',
      },
      {
        id: '9ed485b4-70f2-4e32-8dbc-16149f412e5e',
        type: 'input',
        fieldName: 'KHMSHDon',
        value: '1',
      },
      {
        id: '176b593f-a0ee-4522-bdc6-ecf877ef54ea',
        type: 'input',
        fieldName: 'LoaiHDon',
        value: '=0',
      },
      {
        id: 'e5240027-8169-414d-837a-c3a44caa01ac',
        type: 'input',
        fieldName: 'TCHDon',
        value: '=0',
      },
      {
        id: '8d8bdb95-2911-4660-a59f-47560bc8a0c0',
        type: 'input',
        fieldName: 'DVTTe',
        value: '704',
      },
      {
        id: 'fe7364d0-b294-49a3-8693-e062f5262407',
        type: 'input',
        fieldName: 'TGia',
        value: '=1000.00',
      },
      {
        id: 'e43cfdc2-1a64-42db-93ef-6a200ac9f4ca',
        type: 'input',
        fieldName: 'MTChieu',
        value: '@loanCode',
      },
      {
        id: 'b523bf31-487f-4134-b362-d2a058a42062',
        type: 'input',
        fieldName: 'TgThTien',
        value: '=@loanProfit',
      },
      {
        id: '20dbbee6-a64b-45e8-bfc8-1b42eb468396',
        type: 'input',
        fieldName: 'TTCKTMai',
        value: '=0',
        variable: null,
      },
      {
        id: '959741c6-85e0-4a30-85a1-1bc3102bab67',
        type: 'input',
        fieldName: 'TGTKhac',
        value: '=0',
        variable: null,
      },
      {
        id: 'dc510610-a5f8-4eb4-b2a1-98b1e83b4089',
        type: 'input',
        fieldName: 'TgTThue',
        value: '=0',
        variable: null,
      },
      {
        id: '6eaa0593-6507-4019-a5fb-38e6e0fe0ee2',
        type: 'input',
        fieldName: 'TgTTTBSo',
        value: '=@loanProfit',
      },
      {
        id: 'f2a63c7f-7e9f-4c44-b943-e0009532a65d',
        type: 'variable',
        fieldName: 'DSHHDVu',
        variable: 'singleItem',
        value: null,
        children: [
          {
            id: '57ce68b3-4b4d-4ee0-bff0-33943dbfa0d6',
            type: 'input',
            fieldName: 'TChat',
            value: '=1',
          },
          {
            id: '2b07f8d0-5e2c-40cb-915d-bd5b14487f28',
            type: 'input',
            fieldName: 'STT',
            value: '=1',
          },
          {
            id: 'b4d680dc-0c25-447e-b726-d959323212ba',
            type: 'input',
            fieldName: 'THHDVu',
            value:
              'Lãi tiền vay, Phí dịch vụ từ ngày @loanPeriodStartAt đến ngày @loanPeriodEndAt Theo hợp đồng số :@loanCode ký ngày @loanSignedAt',
          },
          {
            id: '735eb050-f2a2-4464-9b49-e0e792ccde4f',
            type: 'input',
            fieldName: 'SLuong',
            value: '=1',
          },
          {
            id: '7beea850-8795-4c13-b05d-9290849840b7',
            type: 'input',
            fieldName: 'DGia',
            value: '= @loanProfit',
          },
          {
            id: 'd6fc820c-d4c5-4a0e-91e1-2307f93b7d2c',
            type: 'input',
            fieldName: 'ThTienChuaCK',
            value: '= @loanProfit',
          },
          {
            id: '076517f9-a83a-45ae-8328-27179b632d2b',
            type: 'input',
            fieldName: 'TLCKhau',
            value: '=0',
          },
          {
            id: 'c0f31d68-a665-46ea-ba4d-14383650a9fd',
            type: 'input',
            fieldName: 'STCKhau',
            value: '=0',
          },
          {
            id: '38a3649e-933a-4148-bd8c-4fd89d7cf3f1',
            type: 'input',
            fieldName: 'ThTien',
            value: '= @loanProfit',
          },
          {
            id: '33d6d135-da03-4d25-bfb0-d67f4ad886be',
            type: 'input',
            fieldName: 'TSuat',
            value: '=0',
          },
          {
            id: '2c59d0ed-0952-44b7-a27c-95f45870707d',
            type: 'input',
            fieldName: 'TThue',
            value: '=0',
          },
          {
            id: '8e02688a-a9fd-4349-a364-3f2ab74541a8',
            type: 'input',
            fieldName: 'TgTien',
            value: '= @loanProfit',
          },
        ],
      },
    ],
  },
  [PluginEInvoiceTemplateType.ORDER_INCOME_RECEIPT]: {
    fields: [],
  },
};
