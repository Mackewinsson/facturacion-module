'use client'
import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Cliente, TipoCliente, Entidad, TipoEntidad } from '@/lib/mock-data'
import BaseModal from './BaseModal'

interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
  onClientAdded: (client: Cliente | Entidad) => void
  suggestedName?: string
  isEntityModal?: boolean
}

type ContactType = 'empresa' | 'persona'
type TabType = 'basico' | 'cuentas' | 'preferencias' | 'contabilidad'

interface FormData {
  // Entity Identification
  NIF: string
  razonSocial: string
  nombreComercial: string
  
  // Persona Física fields
  nombre?: string
  apellido1?: string
  apellido2?: string
  sexo?: 'hombre' | 'mujer'
  
  // Dates
  fechaAlta: string
  fechaBaja: string
  
  // Type and Classification
  personaFisica: boolean
  tipoIdentificador: 'NIF/CIF-IVA' | 'NIE' | 'PASAPORTE' | 'OTRO'
  paisOrigen: string
  extranjero: boolean
  operadorIntracomunitario: boolean
  importacionExportacion: boolean
  regimenCanario: boolean
  
  // Entity Relationships
  proveedor: boolean
  cliente: boolean
  vendedor: boolean
  operarioTaller: boolean
  aseguradora: boolean
  financiera: boolean
  agenciaTransporte: boolean
  banco: boolean
  rentacar: boolean
  
  // Currency and Additional Info
  monedaEntidad: string
  
  // Contact Information
  telefono: string
  email: string
  movil: string
  website: string
  identificacionVAT: string
  tags: string
  tipoContacto: string
  domicilio: {
    calle: string
    codigoPostal: string
    municipio: string
    provincia: string
    pais: string
  }
  
  // Legacy fields for compatibility
  tipoEntidad: TipoEntidad
  tipo: TipoCliente
  nombreORazonSocial: string
  pais: string
}

const getDefaultValues = (suggestedName: string): FormData => ({
  // Entity Identification
  NIF: '',
  razonSocial: suggestedName,
  nombreComercial: '',
  
  // Persona Física fields
  nombre: '',
  apellido1: '',
  apellido2: '',
  sexo: undefined,
  
  // Dates
  fechaAlta: new Date().toISOString().split('T')[0],
  fechaBaja: '',
  
  // Type and Classification
  personaFisica: false,
  tipoIdentificador: 'NIF/CIF-IVA',
  paisOrigen: 'ESPAÑA',
  extranjero: false,
  operadorIntracomunitario: false,
  importacionExportacion: false,
  regimenCanario: false,
  
  // Entity Relationships
  proveedor: false,
  cliente: true,
  vendedor: false,
  operarioTaller: false,
  aseguradora: false,
  financiera: false,
  agenciaTransporte: false,
  banco: false,
  rentacar: false,
  
  // Currency and Additional Info
  monedaEntidad: 'Eur',
  
  // Contact Information
  telefono: '',
  email: '',
  movil: '',
  website: '',
  identificacionVAT: '',
  tags: '',
  tipoContacto: 'Sin especificar',
  domicilio: {
    calle: '',
    codigoPostal: '',
    municipio: '',
    provincia: '',
    pais: 'España'
  },
  
  // Legacy fields for compatibility
  tipoEntidad: 'cliente',
  tipo: 'empresario/profesional',
  nombreORazonSocial: suggestedName,
  pais: 'España'
})

export default function AddClientModal({ isOpen, onClose, onClientAdded, suggestedName = '', isEntityModal = false }: AddClientModalProps) {
  const [contactType, setContactType] = useState<ContactType>('empresa')
  const [activeTab, setActiveTab] = useState<TabType>('basico')

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: getDefaultValues(suggestedName),
    mode: 'onChange'
  })

  // Reset form when suggestedName changes
  useEffect(() => {
    if (suggestedName) {
      setValue('razonSocial', suggestedName)
      setValue('nombreORazonSocial', suggestedName)
    }
  }, [suggestedName, setValue])

  // Watch form values for display
  const tipoEntidad = watch('tipoEntidad')
  const personaFisica = watch('personaFisica')

  const applyContactType = (type: ContactType) => {
    const isPersona = type === 'persona'
    setContactType(type)
    setValue('personaFisica', isPersona)
    setValue('tipo', isPersona ? 'particular' : 'empresario/profesional')

    // Clear opposite fields to avoid accidental payload mixups
    if (isPersona) {
      setValue('razonSocial', '')
      setValue('nombreComercial', '')
    } else {
      setValue('nombre', '')
      setValue('apellido1', '')
      setValue('apellido2', '')
      setValue('sexo', undefined)
    }
  }

  const computeNombreORazonSocial = (data: FormData) => {
    if (data.personaFisica && data.nombre && data.apellido1) {
      return `${data.nombre} ${data.apellido1}${data.apellido2 ? ' ' + data.apellido2 : ''}`.trim()
    }
    return (data.razonSocial || '').trim()
  }

  const onSubmit = (data: FormData) => {
    // Ensure legacy compatibility fields are consistent
    const displayName = computeNombreORazonSocial(data)
    const payload: FormData = {
      ...data,
      nombreORazonSocial: displayName,
      // If persona física, razonSocial is not required but backend may still use it as fallback.
      razonSocial: data.personaFisica ? displayName : data.razonSocial
    }
    onClientAdded(payload as unknown as Cliente | Entidad)
    onClose()
    // Reset form
    reset(getDefaultValues(''))
  }

  const handleClose = () => {
    onClose()
    reset(getDefaultValues(''))
  }

  const tabs = [
    { id: 'basico', label: 'Básico' },
    { id: 'cuentas', label: 'Cuentas' },
    { id: 'preferencias', label: 'Preferencias' },
    { id: 'contabilidad', label: 'Contabilidad' }
  ]

  if (!isOpen) return null

  const footer = (
    <>
      <button
        type="button"
        onClick={handleClose}
        className="px-4 py-2 text-secondary-foreground bg-secondary rounded-md hover:bg-secondary/80 font-medium"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="entity-form"
        className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 font-medium"
      >
        Crear
      </button>
    </>
  )

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEntityModal ? 'Nueva Entidad' : 'Nuevo contacto'}
      footer={footer}
      maxWidth="4xl"
    >

          {/* Entity Type Selection (only for entity modal) */}
          {isEntityModal && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-card-foreground mb-3">Tipo de Entidad</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setValue('tipoEntidad', 'cliente')}
                  className={`px-4 py-2 rounded-md font-medium ${
                    tipoEntidad === 'cliente'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  Cliente
                </button>
                <button
                  type="button"
                  onClick={() => setValue('tipoEntidad', 'proveedor')}
                  className={`px-4 py-2 rounded-md font-medium ${
                    tipoEntidad === 'proveedor'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  Proveedor
                </button>
                <button
                  type="button"
                  onClick={() => setValue('tipoEntidad', 'vendedor')}
                  className={`px-4 py-2 rounded-md font-medium ${
                    tipoEntidad === 'vendedor'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  Vendedor
                </button>
              </div>
            </div>
          )}

          {/* Contact Type Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-card-foreground mb-3">Este contacto es...</label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => applyContactType('empresa')}
                className={`px-4 py-2 rounded-md font-medium ${
                  contactType === 'empresa'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                Empresa
              </button>
              <button
                type="button"
                onClick={() => applyContactType('persona')}
                className={`px-4 py-2 rounded-md font-medium ${
                  contactType === 'persona'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                Persona
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          {/* <div className="mb-6">
            <div className="border-b border-border">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-accent text-accent'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div> */}

          {Object.keys(errors).length > 0 && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-900 rounded">
              <ul className="list-disc list-inside">
                {errors.razonSocial && (
                  <li className="text-sm font-medium">{errors.razonSocial.message}</li>
                )}
                {errors.nombre && (
                  <li className="text-sm font-medium">{errors.nombre.message}</li>
                )}
                {errors.apellido1 && (
                  <li className="text-sm font-medium">{errors.apellido1.message}</li>
                )}
                {errors.NIF && (
                  <li className="text-sm font-medium">{errors.NIF.message}</li>
                )}
                {errors.domicilio?.calle && (
                  <li className="text-sm font-medium">{errors.domicilio.calle.message}</li>
                )}
              </ul>
            </div>
          )}

          <form id="entity-form" onSubmit={handleSubmit(onSubmit)}>
            {activeTab === 'basico' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Entity Identification */}
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">NIF</label>
                    <input
                      type="text"
                      {...register('NIF', { required: 'El NIF es obligatorio' })}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      placeholder="NIF"
                    />
                  </div>
                  
                  {!personaFisica ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-2">Razón Social</label>
                        <input
                          type="text"
                          {...register('razonSocial', {
                            validate: (value, formValues) => {
                              if (!formValues.personaFisica && !value?.trim()) {
                                return 'La razón social es obligatoria'
                              }
                              return true
                            }
                          })}
                          className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                          placeholder="Razón Social"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-2">N. Comercial</label>
                        <input
                          type="text"
                          {...register('nombreComercial')}
                          className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                          placeholder="Nombre Comercial"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-2">Nombre</label>
                        <input
                          type="text"
                          {...register('nombre', {
                            validate: (value, formValues) => {
                              if (formValues.personaFisica && !value?.trim()) {
                                return 'El nombre es obligatorio'
                              }
                              return true
                            }
                          })}
                          className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                          placeholder="Nombre"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-2">Apellido 1</label>
                        <input
                          type="text"
                          {...register('apellido1', {
                            validate: (value, formValues) => {
                              if (formValues.personaFisica && !value?.trim()) {
                                return 'El primer apellido es obligatorio'
                              }
                              return true
                            }
                          })}
                          className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                          placeholder="Primer apellido"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-2">Apellido 2</label>
                        <input
                          type="text"
                          {...register('apellido2')}
                          className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                          placeholder="Segundo apellido"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-2">Sexo</label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm text-foreground">
                            <input
                              type="radio"
                              value="hombre"
                              {...register('sexo')}
                            />
                            Hombre
                          </label>
                          <label className="flex items-center gap-2 text-sm text-foreground">
                            <input
                              type="radio"
                              value="mujer"
                              {...register('sexo')}
                            />
                            Mujer
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">Alta</label>
                      <input
                        type="date"
                        {...register('fechaAlta')}
                        className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">Baja</label>
                      <input
                        type="date"
                        {...register('fechaBaja')}
                        className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      />
                    </div>
                  </div>
                  
                  <Controller
                    name="personaFisica"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={Boolean(field.value)}
                          onChange={(e) => {
                            const checked = e.target.checked
                            field.onChange(checked)
                            applyContactType(checked ? 'persona' : 'empresa')
                          }}
                          className="mr-2"
                        />
                        <label className="text-sm text-card-foreground">Persona física</label>
                      </div>
                    )}
                  />
                  
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Verificar datos con Hacienda
                  </button>
                  
                  {/* Type and Classification */}
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Tipo Identificador</label>
                    <select
                      {...register('tipoIdentificador')}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                    >
                      <option value="NIF/CIF-IVA">NIF/CIF-IVA</option>
                      <option value="NIE">NIE</option>
                      <option value="PASAPORTE">PASAPORTE</option>
                      <option value="OTRO">OTRO</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">País de origen</label>
                    <select
                      {...register('paisOrigen')}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                    >
                      <option value="ESPAÑA">ESPAÑA</option>
                      <option value="FRANCIA">FRANCIA</option>
                      <option value="PORTUGAL">PORTUGAL</option>
                      <option value="ITALIA">ITALIA</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Controller
                      name="extranjero"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="mr-2"
                          />
                          <label className="text-sm text-card-foreground">Extranjero/a</label>
                        </div>
                      )}
                    />
                    <Controller
                      name="operadorIntracomunitario"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="mr-2"
                          />
                          <label className="text-sm text-card-foreground">Operador intracomunitario</label>
                        </div>
                      )}
                    />
                    <Controller
                      name="importacionExportacion"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="mr-2"
                          />
                          <label className="text-sm text-card-foreground">Importación/Exportación</label>
                        </div>
                      )}
                    />
                    <Controller
                      name="regimenCanario"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="mr-2"
                          />
                          <label className="text-sm text-card-foreground">Régimen Canario</label>
                        </div>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Dirección</label>
                    <input
                      type="text"
                      {...register('domicilio.calle', {
                        validate: (value, formValues) => {
                          if (!formValues.personaFisica && !value?.trim()) {
                            return 'La dirección es obligatoria para empresas'
                          }
                          return true
                        }
                      })}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      placeholder="Dirección"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">Población</label>
                      <input
                        type="text"
                        {...register('domicilio.municipio')}
                        className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                        placeholder="Población"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">Código postal</label>
                      <input
                        type="text"
                        {...register('domicilio.codigoPostal')}
                        className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                        placeholder="Código postal"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Provincia</label>
                    <input
                      type="text"
                      {...register('domicilio.provincia')}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      placeholder="Provincia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">País</label>
                    <select
                      {...register('domicilio.pais')}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                    >
                      <option value="España">España</option>
                      <option value="Francia">Francia</option>
                      <option value="Portugal">Portugal</option>
                      <option value="Italia">Italia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Nombre comercial</label>
                    <input
                      type="text"
                      {...register('nombreComercial')}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      placeholder="Nombre comercial"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Identificación VAT</label>
                    <input
                      type="text"
                      {...register('identificacionVAT')}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      placeholder="Identificación VAT"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Asignar usuarios</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      placeholder="Usuarios"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Modification Details */}
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm text-gray-600 mb-1">Modificado por:</div>
                    <div className="text-sm font-medium">USUARIO6, DEMO</div>
                    <div className="text-sm text-gray-600 mb-1 mt-2">El día:</div>
                    <div className="text-sm font-medium">03/12/2024 12:02:00</div>
                  </div>
                  
                  {/* Currency */}
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Moneda de la entidad</label>
                    <select
                      {...register('monedaEntidad')}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                    >
                      <option value="Eur">Eur</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  
                  {/* Relationships */}
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Relaciones</label>
                    <div className="space-y-2">
                      <Controller
                        name="proveedor"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mr-2"
                            />
                            <label className="text-sm text-card-foreground">Proveedor</label>
                          </div>
                        )}
                      />
                      <Controller
                        name="cliente"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mr-2"
                            />
                            <label className="text-sm text-card-foreground">Cliente</label>
                          </div>
                        )}
                      />
                      <Controller
                        name="vendedor"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mr-2"
                            />
                            <label className="text-sm text-card-foreground">Vendedor</label>
                          </div>
                        )}
                      />
                      <Controller
                        name="operarioTaller"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mr-2"
                            />
                            <label className="text-sm text-card-foreground">Operario de Taller</label>
                          </div>
                        )}
                      />
                      <Controller
                        name="aseguradora"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mr-2"
                            />
                            <label className="text-sm text-card-foreground">Aseguradora</label>
                          </div>
                        )}
                      />
                      <Controller
                        name="financiera"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mr-2"
                            />
                            <label className="text-sm text-card-foreground">Financiera</label>
                          </div>
                        )}
                      />
                      <Controller
                        name="agenciaTransporte"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mr-2"
                            />
                            <label className="text-sm text-card-foreground">Agencia de Transporte</label>
                          </div>
                        )}
                      />
                      <Controller
                        name="banco"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mr-2"
                            />
                            <label className="text-sm text-card-foreground">Banco</label>
                          </div>
                        )}
                      />
                      <Controller
                        name="rentacar"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mr-2"
                            />
                            <label className="text-sm text-card-foreground">Rentacar</label>
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Email</label>
                    <input
                      type="email"
                      {...register('email')}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      placeholder="Email"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">Teléfono</label>
                      <input
                        type="tel"
                        {...register('telefono')}
                        className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                        placeholder="Teléfono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">Móvil</label>
                      <input
                        type="tel"
                        {...register('movil')}
                        className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                        placeholder="Móvil"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Website</label>
                    <input
                      type="url"
                      {...register('website')}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      placeholder="Website"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Tags</label>
                    <input
                      type="text"
                      {...register('tags')}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      placeholder="Tags"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Tipo de contacto</label>
                    <select
                      {...register('tipoContacto')}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                    >
                      <option value="Sin especificar">Sin especificar</option>
                      <option value="Cliente">Cliente</option>
                      <option value="Proveedor">Proveedor</option>
                      <option value="Cliente y Proveedor">Cliente y Proveedor</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* {activeTab === 'cuentas' && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Contenido de la pestaña Cuentas</p>
              </div>
            )}

            {activeTab === 'preferencias' && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Contenido de la pestaña Preferencias</p>
              </div>
            )}

            {activeTab === 'contabilidad' && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Contenido de la pestaña Contabilidad</p>
              </div>
            )} */}

          </form>
    </BaseModal>
  )
}
