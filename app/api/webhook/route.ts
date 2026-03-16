import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    console.log("Received webhook with signature:", signature)
    console.log("Webhook body:", body)

    console.log("TODO: Add Printify API integration here to create production order")

    return NextResponse.json({
      success: true,
      message: "Webhook received successfully",
    })

  } catch (error) {
    console.error("Error in webhook API:", error)
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    )
  }
}
