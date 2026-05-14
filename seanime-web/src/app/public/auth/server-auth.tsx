import { serverAuthTokenAtom } from "@/app/(main)/_atoms/server-status.atoms"
import { defineSchema, Field, Form } from "@/components/ui/form"
import { Modal } from "@/components/ui/modal"
import { createTranslator } from "@/locales"
import { useAtom } from "jotai"
import { sha256 } from "js-sha256"
import React, { useState } from "react"

const t = createTranslator("es")

export function ServerAuth() {

    const [, setAuthToken] = useAtom(serverAuthTokenAtom)
    const [loading, setLoading] = useState(false)

    return (<>
        <Modal
            title={t("auth.passwordRequired")}
            description={t("auth.authRequired")}
            open={true}
            onOpenChange={(v) => {}}
            overlayClass="bg-opacity-100 bg-gray-900"
            contentClass="border focus:outline-none focus-visible:outline-none outline-none"
            hideCloseButton
        >
            <Form
                schema={defineSchema(({ z }) => z.object({
                    password: z.string().min(1, t("auth.passwordFieldRequired")),
                }))}
                onSubmit={async data => {
                    setLoading(true)
                    const hash = sha256(data.password)
                    setAuthToken(hash)
                    React.startTransition(() => {
                        window.location.href = "/"
                        setLoading(false)
                    })
                }}
            >
                <Field.Text
                    type="password"
                    name="password"
                    label={t("auth.enterPassword")}
                    fieldClass=""
                />
                <Field.Submit showLoadingOverlayOnSuccess loading={loading}>{t("navigation.continue")}</Field.Submit>
            </Form>
        </Modal>
    </>)
}
