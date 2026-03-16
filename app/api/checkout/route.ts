import { NextResponse } from "next/server"

interface CheckoutRequest {
  size: string
  imageUrl: string
}

export async function POST(request: Request) {
  try {
    const body: CheckoutRequest = await request.json()
    const { size, imageUrl } = body

    if (!size || !imageUrl) {
      return NextResponse.json(
        { error: "Size and imageUrl are required" },
        { status: 400 }
      )
    }

    console.log("Creating checkout session for size:", size)
    console.log("Image URL:", imageUrl)

    const mockCheckoutUrl = "https://example.com/checkout"

    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      checkoutUrl: mockCheckoutUrl,
      orderId: `order_${Date.now()}`,
    })

  } catch (error) {
    console.error("Error in checkout API:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
